import type { Department } from '@/types/department'

export const initialDepartments: Department[] = [
  {
    id: 'DEP-001',
    name: 'Computer Science',
    code: 'CS',
    description:
      'Programs covering software engineering, artificial intelligence, data science, and computing systems.',
    status: 'Active',
    createdDate: '2024-01-15',
  },
  {
    id: 'DEP-002',
    name: 'Electrical Engineering',
    code: 'EE',
    description:
      'Undergraduate and graduate studies in circuits, power systems, electronics, and signal processing.',
    status: 'Active',
    createdDate: '2024-01-18',
  },
  {
    id: 'DEP-003',
    name: 'Business Administration',
    code: 'BA',
    description:
      'Management, finance, marketing, and entrepreneurship programs for business leaders.',
    status: 'Active',
    createdDate: '2024-02-02',
  },
  {
    id: 'DEP-004',
    name: 'Mathematics',
    code: 'MATH',
    description:
      'Pure and applied mathematics, statistics, and quantitative methods across university programs.',
    status: 'Active',
    createdDate: '2024-02-10',
  },
  {
    id: 'DEP-005',
    name: 'Physics',
    code: 'PHY',
    description:
      'Theoretical and experimental physics with research in materials, optics, and astrophysics.',
    status: 'Active',
    createdDate: '2024-02-21',
  },
  {
    id: 'DEP-006',
    name: 'English Literature',
    code: 'ENG',
    description:
      'Literary studies, composition, linguistics, and critical theory across historical periods.',
    status: 'Inactive',
    createdDate: '2024-03-05',
  },
  {
    id: 'DEP-007',
    name: 'Biology',
    code: 'BIO',
    description:
      'Life sciences including molecular biology, ecology, genetics, and biomedical foundations.',
    status: 'Active',
    createdDate: '2024-03-12',
  },
  {
    id: 'DEP-008',
    name: 'Mechanical Engineering',
    code: 'ME',
    description:
      'Design, manufacturing, thermodynamics, and mechanical systems for industry and research.',
    status: 'Active',
    createdDate: '2024-03-20',
  },
]
