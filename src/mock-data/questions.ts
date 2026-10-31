import type { Question } from '@/types/question'

export const initialQuestions: Question[] = [
  {
    id: 'QB-001',
    courseId: 'CRS-001',
    topicId: 'TOP-001',
    type: 'true-false',
    difficulty: 'Easy',
    status: 'Published',
    createdDate: '2026-01-14',
    updatedDate: '2026-02-03',
    content: {
      questionText:
        '<p>In most programming languages, a variable must be declared before its value can be used in an expression.</p>',
      correctAnswer: 'true',
      explanation:
        'A declaration tells the compiler or interpreter the variable name and how its value should be stored. Using a name that was never declared is rejected in statically typed languages and raises an error in most others.',
    },
  },
  {
    id: 'QB-002',
    courseId: 'CRS-001',
    topicId: 'TOP-002',
    type: 'mcq',
    difficulty: 'Medium',
    status: 'Published',
    createdDate: '2026-01-18',
    updatedDate: '2026-01-18',
    content: {
      questionText:
        '<p>Which loop is <strong>guaranteed</strong> to execute its body at least once?</p>',
      answerMode: 'single',
      explanation:
        'A do-while loop checks its condition after the body runs, so the body executes once even when the condition is initially false.',
      options: [
        { id: 'OPT-QB-002-A', label: 'A', text: 'for loop', isCorrect: false },
        { id: 'OPT-QB-002-B', label: 'B', text: 'while loop', isCorrect: false },
        { id: 'OPT-QB-002-C', label: 'C', text: 'do-while loop', isCorrect: true },
        { id: 'OPT-QB-002-D', label: 'D', text: 'enhanced for loop', isCorrect: false },
      ],
    },
  },
  {
    id: 'QB-003',
    courseId: 'CRS-001',
    topicId: 'TOP-003',
    type: 'subjective',
    difficulty: 'Hard',
    status: 'Published',
    createdDate: '2026-01-22',
    updatedDate: '2026-03-11',
    content: {
      questionText:
        '<p>Explain the difference between <strong>parameters</strong> and <strong>arguments</strong>.</p><p>Then describe when a function should return a value instead of printing the result directly.</p>',
      modelAnswer:
        'A parameter is the variable named in the function definition. An argument is the value supplied for that parameter when the function is called. A function should return a value when the caller needs the result for further computation or testing. Printing is appropriate only when the function\'s job is to display output.',
      guidelines:
        'Award points for a clear parameter/argument distinction, a short example of each, and a reasonable explanation of return versus print.',
      marks: 10,
    },
  },
  {
    id: 'QB-004',
    courseId: 'CRS-001',
    topicId: 'TOP-004',
    type: 'mcq',
    difficulty: 'Medium',
    status: 'Published',
    createdDate: '2026-02-02',
    updatedDate: '2026-02-16',
    content: {
      questionText: '<p>Which of the following are linear data structures? Select every correct option.</p>',
      answerMode: 'multiple',
      explanation:
        'Arrays, linked lists, and stacks arrange elements in a single sequence. A binary search tree is hierarchical, so it is not a linear structure.',
      options: [
        { id: 'OPT-QB-004-A', label: 'A', text: 'Array', isCorrect: true },
        { id: 'OPT-QB-004-B', label: 'B', text: 'Linked list', isCorrect: true },
        { id: 'OPT-QB-004-C', label: 'C', text: 'Binary search tree', isCorrect: false },
        { id: 'OPT-QB-004-D', label: 'D', text: 'Stack', isCorrect: true },
      ],
    },
  },
  {
    id: 'QB-005',
    courseId: 'CRS-001',
    topicId: 'TOP-005',
    type: 'true-false',
    difficulty: 'Easy',
    status: 'Published',
    createdDate: '2026-02-06',
    updatedDate: '2026-02-06',
    content: {
      questionText: '<p>A stack follows the first-in, first-out principle.</p>',
      correctAnswer: 'false',
      explanation:
        'A stack is last-in, first-out. The first item pushed is the last item popped. Queues are first-in, first-out.',
    },
  },
  {
    id: 'QB-006',
    courseId: 'CRS-001',
    topicId: 'TOP-006',
    type: 'subjective',
    difficulty: 'Medium',
    status: 'Draft',
    createdDate: '2026-03-01',
    updatedDate: '2026-03-01',
    content: {
      questionText:
        '<p>Compare depth-first traversal and breadth-first traversal of a graph.</p><ul><li>Name the data structure each traversal commonly uses.</li><li>Give one situation where you would choose each approach.</li></ul>',
      modelAnswer:
        'Depth-first traversal follows one path as far as it can before backtracking, and it is commonly implemented with a stack or recursion. Breadth-first traversal visits neighbors level by level and uses a queue. Depth-first search is a natural fit for maze solving and cycle detection. Breadth-first search is preferred when the shortest path in an unweighted graph is required.',
      guidelines:
        'Look for the stack-versus-queue distinction and one valid use case for each traversal.',
      marks: 8,
    },
  },
  {
    id: 'QB-007',
    courseId: 'CRS-001',
    topicId: 'TOP-008',
    type: 'mcq',
    difficulty: 'Easy',
    status: 'Published',
    createdDate: '2026-03-09',
    updatedDate: '2026-04-01',
    content: {
      questionText: '<p>Which SQL clause filters individual rows <strong>before</strong> they are grouped?</p>',
      answerMode: 'single',
      explanation:
        'WHERE filters rows before aggregation. HAVING filters groups after GROUP BY has built them.',
      options: [
        { id: 'OPT-QB-007-A', label: 'A', text: 'ORDER BY', isCorrect: false },
        { id: 'OPT-QB-007-B', label: 'B', text: 'WHERE', isCorrect: true },
        { id: 'OPT-QB-007-C', label: 'C', text: 'HAVING', isCorrect: false },
        { id: 'OPT-QB-007-D', label: 'D', text: 'LIMIT', isCorrect: false },
      ],
    },
  },
  {
    id: 'QB-008',
    courseId: 'CRS-001',
    topicId: 'TOP-007',
    type: 'true-false',
    difficulty: 'Medium',
    status: 'Published',
    createdDate: '2026-03-12',
    updatedDate: '2026-03-20',
    content: {
      questionText:
        '<p>A foreign key must reference a primary key or another candidate key in the related table.</p>',
      correctAnswer: 'true',
      explanation:
        'A foreign key maintains referential integrity by pointing at a candidate key, usually the primary key, of the referenced table.',
    },
  },
  {
    id: 'QB-009',
    courseId: 'CRS-002',
    topicId: 'TOP-009',
    type: 'mcq',
    difficulty: 'Hard',
    status: 'Published',
    createdDate: '2026-04-04',
    updatedDate: '2026-05-19',
    content: {
      questionText:
        '<p>Which measure is the most appropriate when a classification dataset is highly imbalanced?</p>',
      answerMode: 'single',
      explanation:
        'Accuracy can look strong when the majority class dominates the data. F1 score balances precision and recall. Mean squared error and R-squared are regression measures.',
      options: [
        { id: 'OPT-QB-009-A', label: 'A', text: 'Accuracy', isCorrect: false },
        { id: 'OPT-QB-009-B', label: 'B', text: 'F1 score', isCorrect: true },
        { id: 'OPT-QB-009-C', label: 'C', text: 'Mean squared error', isCorrect: false },
        { id: 'OPT-QB-009-D', label: 'D', text: 'R-squared', isCorrect: false },
      ],
    },
  },
  {
    id: 'QB-010',
    courseId: 'CRS-002',
    topicId: 'TOP-011',
    type: 'subjective',
    difficulty: 'Hard',
    status: 'Published',
    createdDate: '2026-04-15',
    updatedDate: '2026-06-02',
    content: {
      questionText:
        '<p>Describe how <strong>backpropagation</strong> updates the weights of a feedforward neural network.</p><ul><li>Mention the role of the loss function.</li><li>Explain the direction in which gradients are applied.</li></ul>',
      modelAnswer:
        'The network makes a prediction and the loss function measures how far that prediction is from the target. Backpropagation applies the chain rule to compute the gradient of the loss with respect to each weight, starting at the output layer and moving back toward the input layer. An optimizer such as gradient descent then nudges each weight in the direction that reduces the loss.',
      guidelines:
        'Full marks require the loss, the backward flow of gradients, and the idea that weights are adjusted to reduce error. A named optimizer is helpful but not required.',
      marks: 15,
    },
  },
  {
    id: 'QB-011',
    courseId: 'CRS-003',
    topicId: 'TOP-012',
    type: 'true-false',
    difficulty: 'Easy',
    status: 'Published',
    createdDate: '2026-05-06',
    updatedDate: '2026-05-06',
    content: {
      questionText:
        '<p>Ohm\'s law states that current is directly proportional to voltage when resistance is constant.</p>',
      correctAnswer: 'true',
      explanation:
        'When resistance is constant, V = IR, so current rises in proportion to the applied voltage.',
    },
  },
  {
    id: 'QB-012',
    courseId: 'CRS-004',
    topicId: 'TOP-013',
    type: 'mcq',
    difficulty: 'Medium',
    status: 'Published',
    createdDate: '2026-05-20',
    updatedDate: '2026-07-08',
    content: {
      questionText:
        '<p>Which of the following are forces in Porter\'s Five Forces model? Select every correct option.</p>',
      answerMode: 'multiple',
      explanation:
        'Threat of new entrants, bargaining power of buyers, and rivalry among existing competitors are three of the five forces. Organizational culture is not one of them.',
      options: [
        { id: 'OPT-QB-012-A', label: 'A', text: 'Threat of new entrants', isCorrect: true },
        { id: 'OPT-QB-012-B', label: 'B', text: 'Bargaining power of buyers', isCorrect: true },
        { id: 'OPT-QB-012-C', label: 'C', text: 'Organizational culture', isCorrect: false },
        {
          id: 'OPT-QB-012-D',
          label: 'D',
          text: 'Rivalry among existing competitors',
          isCorrect: true,
        },
      ],
    },
  },
  {
    id: 'QB-013',
    courseId: 'CRS-005',
    topicId: 'TOP-015',
    type: 'mcq',
    difficulty: 'Easy',
    status: 'Published',
    createdDate: '2026-06-11',
    updatedDate: '2026-06-11',
    content: {
      questionText: '<p>The determinant of a 2 x 2 identity matrix is:</p>',
      answerMode: 'single',
      explanation:
        'An identity matrix has ones on the main diagonal and zeros elsewhere, so its determinant is 1.',
      options: [
        { id: 'OPT-QB-013-A', label: 'A', text: '0', isCorrect: false },
        { id: 'OPT-QB-013-B', label: 'B', text: '1', isCorrect: true },
        { id: 'OPT-QB-013-C', label: 'C', text: '-1', isCorrect: false },
        { id: 'OPT-QB-013-D', label: 'D', text: 'Undefined', isCorrect: false },
      ],
    },
  },
  {
    id: 'QB-014',
    courseId: 'CRS-004',
    topicId: 'TOP-014',
    type: 'subjective',
    difficulty: 'Medium',
    status: 'Draft',
    createdDate: '2026-07-02',
    updatedDate: '2026-08-14',
    content: {
      questionText:
        '<p>Outline the purpose of the three primary financial statements and how a reader uses them together.</p>',
      modelAnswer:
        'The balance sheet reports assets, liabilities, and equity at a point in time. The income statement reports revenues, expenses, and profit over a period. The cash flow statement explains how operating, investing, and financing activities changed cash. Together they show what the organization owns, whether it earned a profit, and whether that profit produced cash.',
      guidelines:
        'Expect one accurate purpose for each statement and a sentence connecting profit with cash.',
      marks: 12,
    },
  },
  {
    id: 'QB-015',
    courseId: 'CRS-002',
    topicId: 'TOP-010',
    type: 'true-false',
    difficulty: 'Hard',
    status: 'Published',
    createdDate: '2026-08-21',
    updatedDate: '2026-09-30',
    content: {
      questionText: '<p>K-means clustering requires labeled training examples in order to form groups.</p>',
      correctAnswer: 'false',
      explanation:
        'K-means is unsupervised. It groups unlabeled points by distance to centroids and does not use class labels during training.',
    },
  },
]
