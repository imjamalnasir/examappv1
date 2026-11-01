import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import { StudentCreatePage } from '@/pages/students/StudentCreatePage'
import { StudentEditPage } from '@/pages/students/StudentEditPage'
import { StudentsListPage } from '@/pages/students/StudentsListPage'
import { StudentViewPage } from '@/pages/students/StudentViewPage'
import { ExamApprovalPage } from '@/pages/exams/ExamApprovalPage'
import { ExamCreatePage } from '@/pages/exams/ExamCreatePage'
import { ExamEditPage } from '@/pages/exams/ExamEditPage'
import { ExamForwardPage } from '@/pages/exams/ExamForwardPage'
import { ExamQuestionsPage } from '@/pages/exams/ExamQuestionsPage'
import { ExamsListPage } from '@/pages/exams/ExamsListPage'
import { ExamViewPage } from '@/pages/exams/ExamViewPage'

function DepartmentsRedirect() {
  const location = useLocation()
  const next = `${location.pathname.replace(/^\/departments/, '/wings')}${location.search}${location.hash}`
  return <Navigate to={next} replace />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/wings" replace />} />

        <Route path="academics">
          <Route index element={<AcademicsListPage />} />
          <Route path="new" element={<AcademicCreatePage />} />
          <Route path=":id" element={<AcademicViewPage />} />
          <Route path=":id/edit" element={<AcademicEditPage />} />
          <Route path=":id/semesters" element={<ManageSemestersPage />} />
          <Route path=":id/semesters/:semesterId" element={<ManageSemesterSubjectsPage />} />
        </Route>

        <Route path="wings">
          <Route index element={<DepartmentsListPage />} />
          <Route path="new" element={<DepartmentCreatePage />} />
          <Route path=":id" element={<DepartmentViewPage />} />
          <Route path=":id/edit" element={<DepartmentEditPage />} />
        </Route>
        <Route path="departments/*" element={<DepartmentsRedirect />} />
        <Route path="departments" element={<DepartmentsRedirect />} />

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

        <Route path="students">
          <Route index element={<StudentsListPage />} />
          <Route path="new" element={<StudentCreatePage />} />
          <Route path=":id" element={<StudentViewPage />} />
          <Route path=":id/edit" element={<StudentEditPage />} />
        </Route>

        <Route path="exams">
          <Route index element={<ExamsListPage />} />
          <Route path="new" element={<ExamCreatePage />} />
          <Route path=":id" element={<ExamViewPage />} />
          <Route path=":id/edit" element={<ExamEditPage />} />
          <Route path=":id/questions" element={<ExamQuestionsPage />} />
          <Route path=":id/forward" element={<ExamForwardPage />} />
          <Route path=":id/approval" element={<ExamApprovalPage />} />
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

        <Route path="*" element={<Navigate to="/wings" replace />} />
      </Route>
    </Routes>
  )
}
