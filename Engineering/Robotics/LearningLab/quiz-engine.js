/**
 * 机器人学题库与智能考核中心 - 核心考核引擎 (Exam Engine)
 * 支持：
 * 1. 模块动态抽题组卷
 * 2. 实时草稿自动保存 (localStorage) 与无缝恢复续考
 * 3. 智能判分 (单选、不定项多选多维判定、填空容错、手算打分)
 * 4. 每日三题挑战 (手算题严格限制 <= 1 题，支持不定项多选与打卡日历)
 * 5. 智能错题本自动归档与定向强化重测
 */

(function(global) {
  const STORAGE_KEYS = {
    DRAFT_EXAM: 'ROBOTICS_CRAIG_EXAM_DRAFT_v1',
    HISTORY: 'ROBOTICS_CRAIG_EXAM_HISTORY_v1',
    DAILY_DRILL: 'ROBOTICS_CRAIG_DAILY_DRILL_v1',
    ERROR_BOOK: 'ROBOTICS_CRAIG_ERROR_BOOK_v1',
    STATS: 'ROBOTICS_CRAIG_STATS_v1'
  };

  // 内存备用存储（防止 node 环境或无痕模式报错）
  const memStore = {};
  const safeStorage = {
    getItem(k) {
      if (typeof localStorage !== 'undefined') {
        try { return safeStorage.getItem(k); } catch (e) { return memStore[k] || null; }
      }
      return memStore[k] || null;
    },
    setItem(k, v) {
      if (typeof localStorage !== 'undefined') {
        try { safeStorage.setItem(k, v); return; } catch (e) {}
      }
      memStore[k] = String(v);
    },
    removeItem(k) {
      if (typeof localStorage !== 'undefined') {
        try { safeStorage.removeItem(k); return; } catch (e) {}
      }
      delete memStore[k];
    }
  };

  class QuizEngine {
    constructor(questionBank, modules) {
      this.bank = questionBank || (typeof CRAIG_QUESTION_BANK !== 'undefined' ? CRAIG_QUESTION_BANK : []);
      this.modules = modules || (typeof CRAIG_MODULES !== 'undefined' ? CRAIG_MODULES : {});
      this.activeExam = null;
    }

    // =========================================================================
    // 1. 模块完整考核 (Module Full Exam) 状态机与组卷
    // =========================================================================

    /**
     * 开始一个模块的完整考核
     * @param {string} moduleId - 模块ID (如 'ch06_dynamics_foundations')
     * @param {number} count - 抽题数量 (默认 6~10)
     */
    startModuleExam(moduleId, count = 10) {
      const pool = this.bank.filter(q => q.module === moduleId);
      if (!pool || pool.length === 0) {
        throw new Error(`模块 ${moduleId} 题目池为空！`);
      }

      // 智能分层组卷算法：标准 10 题 100 分试卷 (3单选 + 2不定项多选 + 2判断 + 2填空 + 1手算)
      const singles = pool.filter(q => q.type === 'single').sort(() => Math.random() - 0.5);
      const multiples = pool.filter(q => q.type === 'multiple').sort(() => Math.random() - 0.5);
      const tfs = pool.filter(q => q.type === 'tf').sort(() => Math.random() - 0.5);
      const blanks = pool.filter(q => q.type === 'blank').sort(() => Math.random() - 0.5);
      const calcs = pool.filter(q => q.type === 'calc').sort(() => Math.random() - 0.5);

      const selectedQuestions = [
        ...singles.slice(0, 3),
        ...multiples.slice(0, 2),
        ...tfs.slice(0, 2),
        ...blanks.slice(0, 2),
        ...calcs.slice(0, 1)
      ];

      // 若某些小题型不足 10 题，从剩余题池中补齐
      if (selectedQuestions.length < count) {
        const remaining = pool.filter(q => !selectedQuestions.some(sq => sq.id === q.id)).sort(() => Math.random() - 0.5);
        while (selectedQuestions.length < count && remaining.length > 0) {
          selectedQuestions.push(remaining.pop());
        }
      }

      const examId = 'exam_' + Date.now();
      this.activeExam = {
        examId: examId,
        moduleId: moduleId,
        moduleTitle: this.modules[moduleId] ? this.modules[moduleId].title : moduleId,
        startTime: Date.now(),
        lastSavedTime: Date.now(),
        durationSeconds: 0,
        questions: selectedQuestions,
        userAnswers: {}, // { [questionId]: answerValue }
        flaggedQuestions: {}, // { [questionId]: boolean } 标记待查
        currentIndex: 0,
        isSubmitted: false
      };

      this.saveDraft();
      return this.activeExam;
    }

    /**
     * 实时保存草稿至 localStorage
     */
    saveDraft() {
      if (!this.activeExam || this.activeExam.isSubmitted) return;
      this.activeExam.lastSavedTime = Date.now();
      try {
        safeStorage.setItem(STORAGE_KEYS.DRAFT_EXAM, JSON.stringify(this.activeExam));
      } catch (e) {
        console.error('保存考试草稿失败:', e);
      }
    }

    /**
     * 检查是否有未完成的草稿
     */
    getPendingDraft() {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.DRAFT_EXAM);
        if (!raw) return null;
        const draft = JSON.parse(raw);
        if (draft && !draft.isSubmitted && draft.questions && draft.questions.length > 0) {
          return draft;
        }
      } catch (e) {
        console.error('读取草稿失败:', e);
      }
      return null;
    }

    /**
     * 恢复未完成的草稿
     */
    resumeDraft() {
      const draft = this.getPendingDraft();
      if (draft) {
        this.activeExam = draft;
        return this.activeExam;
      }
      return null;
    }

    /**
     * 放弃当前草稿
     */
    discardDraft() {
      this.activeExam = null;
      try {
        safeStorage.removeItem(STORAGE_KEYS.DRAFT_EXAM);
      } catch (e) {}
    }

    /**
     * 记录当前题目答案并即刻自动保存
     */
    recordAnswer(questionId, answerValue) {
      if (!this.activeExam || this.activeExam.isSubmitted) return;
      this.activeExam.userAnswers[questionId] = answerValue;
      this.saveDraft();
    }

    /**
     * 切换题目标记（待检查）
     */
    toggleFlagQuestion(questionId) {
      if (!this.activeExam || this.activeExam.isSubmitted) return;
      this.activeExam.flaggedQuestions[questionId] = !this.activeExam.flaggedQuestions[questionId];
      this.saveDraft();
    }

    // =========================================================================
    // 2. 智能判分引擎 (Grading Engine)
    // =========================================================================

    /**
     * 判定单道题目的得分情况
     * @param {Object} q - 题目对象
     * @param {any} userAns - 用户提交的答案
     */
    gradeSingleQuestion(q, userAns) {
      const maxScore = q.score || 10;
      let earnedScore = 0;
      let status = 'wrong'; // 'correct' | 'partial' | 'wrong' | 'unanswered'
      let message = '';

      if (userAns === undefined || userAns === null || userAns === '') {
        return { earnedScore: 0, maxScore, status: 'unanswered', message: '未作答' };
      }

      switch (q.type) {
        case 'single':
        case 'tf':
          if (userAns === q.answer) {
            earnedScore = maxScore;
            status = 'correct';
          } else {
            earnedScore = 0;
            status = 'wrong';
          }
          break;

        case 'multiple': {
          // 不定项多选：全对满分，漏选得一半，错选不得分
          const correctArr = Array.isArray(q.answer) ? q.answer : [q.answer];
          const userArr = Array.isArray(userAns) ? userAns : [];

          if (userArr.length === 0) {
            status = 'unanswered';
            earnedScore = 0;
            break;
          }

          // 检查是否有任何错选
          const hasWrongChoice = userArr.some(choice => !correctArr.includes(choice));
          if (hasWrongChoice) {
            earnedScore = 0;
            status = 'wrong';
            message = '含错选选项，不得分';
          } else {
            // 没有错选，检查是否选全
            const isAllChosen = correctArr.every(choice => userArr.includes(choice));
            if (isAllChosen && userArr.length === correctArr.length) {
              earnedScore = maxScore;
              status = 'correct';
              message = '全部选对，满分！';
            } else {
              earnedScore = Math.round(maxScore * 0.5);
              status = 'partial';
              message = `漏选部分正确项，得一半分（${earnedScore}分）`;
            }
          }
          break;
        }

        case 'blank': {
          // 填空题：数学文本与空格归一化比对
          const userStr = String(userAns).trim().toLowerCase().replace(/\s+/g, '');
          const correctList = Array.isArray(q.answer) ? q.answer : [q.answer];
          
          const isMatch = correctList.some(ans => {
            const cleanTarget = String(ans).trim().toLowerCase().replace(/\s+/g, '');
            return userStr === cleanTarget || userStr.includes(cleanTarget);
          });

          if (isMatch) {
            earnedScore = maxScore;
            status = 'correct';
          } else {
            earnedScore = 0;
            status = 'wrong';
          }
          break;
        }

        case 'calc': {
          // 手算题：分步检查或数值匹配
          const userStr = String(userAns).trim().replace(/\s+/g, '');
          const targetStr = String(q.answer).trim().replace(/\s+/g, '');
          
          if (userStr === targetStr) {
            earnedScore = maxScore;
            status = 'correct';
          } else {
            // 简单容差判断 (若包含关键数值)
            const numUser = parseFloat(userStr);
            const numTarget = parseFloat(targetStr);
            if (!isNaN(numUser) && !isNaN(numTarget) && Math.abs(numUser - numTarget) < 0.05) {
              earnedScore = maxScore;
              status = 'correct';
            } else {
              earnedScore = 0;
              status = 'wrong';
            }
          }
          break;
        }

        default:
          earnedScore = (userAns == q.answer) ? maxScore : 0;
          status = earnedScore > 0 ? 'correct' : 'wrong';
      }

      return { earnedScore, maxScore, status, message };
    }

    /**
     * 正式提交考卷并计算总分与历史归档
     */
    submitExam() {
      if (!this.activeExam) throw new Error('没有进行中的考试！');

      const now = Date.now();
      const durationSeconds = Math.max(1, Math.round((now - this.activeExam.startTime) / 1000));
      
      let totalScore = 0;
      let maxTotalScore = 0;
      const questionResults = [];
      const wrongQuestionIds = [];

      this.activeExam.questions.forEach((q, idx) => {
        const userAns = this.activeExam.userAnswers[q.id];
        const grade = this.gradeSingleQuestion(q, userAns);
        
        totalScore += grade.earnedScore;
        maxTotalScore += grade.maxScore;

        const isPassed = grade.status === 'correct';
        if (!isPassed) {
          wrongQuestionIds.push(q.id);
          this.recordErrorQuestion(q.id);
        }

        questionResults.push({
          index: idx + 1,
          question: q,
          userAnswer: userAns,
          grade: grade
        });
      });

      const percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0;

      const report = {
        examId: this.activeExam.examId,
        moduleId: this.activeExam.moduleId,
        moduleTitle: this.activeExam.moduleTitle,
        submitTime: now,
        durationSeconds: durationSeconds,
        totalScore: totalScore,
        maxTotalScore: maxTotalScore,
        percentage: percentage,
        isPassed: percentage >= 60,
        questionResults: questionResults,
        wrongQuestionIds: wrongQuestionIds
      };

      // 归档进历史记录
      this.archiveExamHistory(report);

      // 清除草稿
      this.discardDraft();

      return report;
    }

    /**
     * 归档考试历史记录
     */
    archiveExamHistory(report) {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.HISTORY);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(report); // 最新的放前面
        safeStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(list.slice(0, 50))); // 保留最近50次
      } catch (e) {
        console.error('归档历史记录失败:', e);
      }
    }

    /**
     * 获取所有历史考试记录
     */
    getExamHistory() {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.HISTORY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    // =========================================================================
    // 3. 每日三题挑战 (Daily 3-Question Drill)
    // 约束：手算题严格 <= 1 题；包含不定项多选；支持连续打卡
    // =========================================================================

    /**
     * 获取今天的日期字符串 (YYYY-MM-DD)
     */
    getTodayDateStr() {
      const d = new Date();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    }

    /**
     * 生成或获取今日的每日三题
     */
    getOrGenerateDailyDrill() {
      const todayStr = this.getTodayDateStr();
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.DAILY_DRILL);
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored && stored.date === todayStr) {
            return stored;
          }
        }
      } catch (e) {}

      // 生成今日三题（手算题最多 1 道）
      const calcPool = this.bank.filter(q => q.type === 'calc');
      const nonCalcPool = this.bank.filter(q => q.type !== 'calc');

      const selected = [];
      const includeCalc = (Math.random() < 0.4) && calcPool.length > 0; // 40% 几率抽1道手算

      if (includeCalc) {
        const randCalc = calcPool[Math.floor(Math.random() * calcPool.length)];
        selected.push(randCalc);
      }

      // 剩余题目从非手算池中抽（包含不定项、单选、填空、判断）
      const shuffledNonCalc = [...nonCalcPool].sort(() => Math.random() - 0.5);
      while (selected.length < 3 && shuffledNonCalc.length > 0) {
        const candidate = shuffledNonCalc.pop();
        if (!selected.some(q => q.id === candidate.id)) {
          selected.push(candidate);
        }
      }

      const dailyDrill = {
        date: todayStr,
        generatedAt: Date.now(),
        questions: selected,
        userAnswers: {},
        isSubmitted: false,
        score: 0,
        maxScore: selected.reduce((sum, q) => sum + (q.score || 10), 0),
        durationSeconds: 0
      };

      try {
        safeStorage.setItem(STORAGE_KEYS.DAILY_DRILL, JSON.stringify(dailyDrill));
      } catch (e) {}

      return dailyDrill;
    }

    /**
     * 提交每日三题
     */
    submitDailyDrill(userAnswers) {
      const daily = this.getOrGenerateDailyDrill();
      if (daily.isSubmitted) return daily;

      let totalScore = 0;
      let maxScore = 0;
      const questionResults = [];

      daily.questions.forEach((q, idx) => {
        const ans = userAnswers[q.id];
        const grade = this.gradeSingleQuestion(q, ans);
        totalScore += grade.earnedScore;
        maxScore += grade.maxScore;

        if (grade.status !== 'correct') {
          this.recordErrorQuestion(q.id);
        }

        questionResults.push({
          index: idx + 1,
          question: q,
          userAnswer: ans,
          grade: grade
        });
      });

      daily.userAnswers = userAnswers;
      daily.isSubmitted = true;
      daily.submittedAt = Date.now();
      daily.score = totalScore;
      daily.maxScore = maxScore;
      daily.questionResults = questionResults;

      // 更新连续打卡天数
      this.updateStreak(daily.date);

      try {
        safeStorage.setItem(STORAGE_KEYS.DAILY_DRILL, JSON.stringify(daily));
      } catch (e) {}

      return daily;
    }

    /**
     * 更新连续打卡统计
     */
    updateStreak(todayStr) {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.STATS);
        const stats = raw ? JSON.parse(raw) : { streak: 0, lastDate: '', totalDrills: 0 };
        
        if (stats.lastDate !== todayStr) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
          const yDay = String(yesterday.getDate()).padStart(2, '0');
          const yesterdayStr = `${yesterday.getFullYear()}-${yMonth}-${yDay}`;

          if (stats.lastDate === yesterdayStr) {
            stats.streak += 1;
          } else {
            stats.streak = 1;
          }
          stats.lastDate = todayStr;
          stats.totalDrills += 1;
          safeStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        }
      } catch (e) {}
    }

    /**
     * 获取用户连续打卡与刷题统计
     */
    getUserStats() {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.STATS);
        return raw ? JSON.parse(raw) : { streak: 0, lastDate: '', totalDrills: 0 };
      } catch (e) {
        return { streak: 0, lastDate: '', totalDrills: 0 };
      }
    }

    // =========================================================================
    // 4. 智能错题本 (Error Notebook)
    // =========================================================================

    /**
     * 自动记录错题
     */
    recordErrorQuestion(questionId) {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.ERROR_BOOK);
        const errors = raw ? JSON.parse(raw) : {};
        if (!errors[questionId]) {
          errors[questionId] = {
            id: questionId,
            failCount: 1,
            firstFailedAt: Date.now(),
            lastFailedAt: Date.now(),
            isMastered: false
          };
        } else {
          errors[questionId].failCount += 1;
          errors[questionId].lastFailedAt = Date.now();
          errors[questionId].isMastered = false;
        }
        safeStorage.setItem(STORAGE_KEYS.ERROR_BOOK, JSON.stringify(errors));
      } catch (e) {}
    }

    /**
     * 标记某道错题已掌握
     */
    markErrorMastered(questionId) {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.ERROR_BOOK);
        const errors = raw ? JSON.parse(raw) : {};
        if (errors[questionId]) {
          errors[questionId].isMastered = true;
          safeStorage.setItem(STORAGE_KEYS.ERROR_BOOK, JSON.stringify(errors));
        }
      } catch (e) {}
    }

    /**
     * 获取所有错题详情列表
     */
    getErrorList(moduleId = null) {
      try {
        const raw = safeStorage.getItem(STORAGE_KEYS.ERROR_BOOK);
        const errors = raw ? JSON.parse(raw) : {};
        const list = [];

        for (const [qid, item] of Object.entries(errors)) {
          const q = this.bank.find(x => x.id === qid);
          if (q) {
            if (!moduleId || q.module === moduleId) {
              list.push({ ...item, question: q });
            }
          }
        }

        // 按错误次数降序排列
        return list.sort((a, b) => b.failCount - a.failCount);
      } catch (e) {
        return [];
      }
    }
  }

  global.QuizEngine = QuizEngine;
})(typeof window !== 'undefined' ? window : this);
