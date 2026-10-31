import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AcademicCreatePage } from '@/pages/academics/AcademicCreatePage'
import { AcademicEditPage } from '@/pages/academics/AcademicEditPage'
import { AcademicsListPage } from '@/pages/academics/AcademicsListPage'
import { AcademicViewPage } from '@/pages/academics/AcademicViewPage'
import { ManageSemestersPage } from '@/pages/academics/ManageSemestersPage'
import { ManageSemesterSubjectsPage } from '@/pages/academics/ManageSemesterSubjectsPage'
import { CourseCreatePage } from '@/pages/courses/CourseCreatePage'
import { CourseEditPage } from '@/pages/courses/CourseEditPage'
import { CoursesListPage } from '@/pages/courses/CoursesListPage'
import { CourseViewPage } from '@/pages/courses/CourseViewPage'
import { DepartmentCreatePage } from '@/pages/departments/DepartmentCreatePage'
import { DepartmentEditPage } from '@/pages/departments/DepartmentEditPage'
import { DepartmentsListPage } from '@/pages/departments/DepartmentsListPage'
import { DepartmentViewPage } from '@/pages/departments/DepartmentViewPage'
import { ImportHistoryDetailPage } from '@/pages/question-bank/ImportHistoryDetailPage'
import { ImportHistoryPage } from '@/pages/question-bank/ImportHistoryPage'
import { QuestionCreatePage } from '@/pages/question-bank/QuestionCreatePage'
import { QuestionEditPage } from '@/pages/question-bank/QuestionEditPage'
import { QuestionImportPage } from '@/pages/question-bank/QuestionImportPage'
import { QuestionsListPage } from '@/pages/question-bank/QuestionsListPage'
import { QuestionViewPage } from '@/pages/question-bank/QuestionViewPage'
import { SubjectCreatePage } from '@/pages/subjects/SubjectCreatePage'
import { SubjectEditPage } from '@/pages/subjects/SubjectEditPage'
import { SubjectsListPage } from '@/pages/subjects/SubjectsListPage'
import { SubjectViewPage } from '@/pages/subjects/SubjectViewPage'
import { TopicCreatePage } from '@/pages/topics/TopicCreatePage'
import { TopicEditPage } from '@/pages/topics/TopicEditPage'
import { TopicsListPage } from '@/pages/topics/TopicsListPage'
import { TopicViewPage } from '@/pages/topics/TopicViewPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/departments" replace />} />

        <Route path="academics">
          <Route index element={<AcademicsListPage />} />
          <Route path="new" element={<AcademicCreatePage />} />
          <Route path=":id" element={<AcademicViewPage />} />
          <Route path=":id/edit" element={<AcademicEditPage />} />
          <Route path=":id/semesters" element={<ManageSemestersPage />} />
          <Route path=":id/semesters/:semesterId" element={<ManageSemesterSubjectsPage />} />
        </Route>

        <Route path="departments">
          <Route index element={<DepartmentsListPage />} />
          <Route path="new" element={<DepartmentCreatePage />} />
          <Route path=":id" element={<DepartmentViewPage />} />
          <Route path=":id/edit" element={<DepartmentEditPage />} />
        </Route>

        <Route path="courses">
          <Route index element={<CoursesListPage />} />
          <Route path="new" element={<CourseCreatePage />} />
          <Route path=":id" element={<CourseViewPage />} />
          <Route path=":id/edit" element={<CourseEditPage />} />
        </Route>

        <Route path="subjects">
          <Route index element={<SubjectsListPage />} />
          <Route path="new" element={<SubjectCreatePage />} />
          <Route path=":id" element={<SubjectViewPage />} />
          <Route path=":id/edit" element={<SubjectEditPage />} />
        </Route>

        <Route path="topics">
          <Route index element={<TopicsListPage />} />
          <Route path="new" element={<TopicCreatePage />} />
          <Route path=":id" element={<TopicViewPage />} />
          <Route path=":id/edit" element={<TopicEditPage />} />
        </Route>

        <Route path="question-bank">
          <Route index element={<QuestionsListPage />} />
          <Route path="new" element={<QuestionCreatePage />} />
          <Route path="import" element={<QuestionImportPage />} />
          <Route path="import/history" element={<ImportHistoryPage />} />
          <Route path="import/history/:importId" element={<ImportHistoryDetailPage />} />
          <Route path=":id" element={<QuestionViewPage />} />
          <Route path=":id/edit" element={<QuestionEditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/departments" replace />} />
      </Route>
    </Routes>
  )
}
