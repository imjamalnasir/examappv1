import { BrowserRouter } from 'react-router-dom'
import { AcademicProvider } from '@/context/AcademicContext'
import { ExamProvider } from '@/context/ExamContext'
import { CourseProvider } from '@/context/CourseContext'
import { DepartmentProvider } from '@/context/DepartmentContext'
import { QuestionImportProvider } from '@/context/QuestionImportContext'
import { QuestionProvider } from '@/context/QuestionContext'
import { SubjectProvider } from '@/context/SubjectContext'
import { TopicProvider } from '@/context/TopicContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppRoutes } from '@/routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <DepartmentProvider>
          <CourseProvider>
            <SubjectProvider>
              <TopicProvider>
                <QuestionProvider>
                  <QuestionImportProvider>
                    <AcademicProvider>
                      <ExamProvider>
                        <AppRoutes />
                      </ExamProvider>
                    </AcademicProvider>
                  </QuestionImportProvider>
                </QuestionProvider>
              </TopicProvider>
            </SubjectProvider>
          </CourseProvider>
        </DepartmentProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
