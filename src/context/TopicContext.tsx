import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialTopics } from '@/mock-data/topics'
import { createTopic, getTopicById, updateTopic } from '@/services/topicService'
import type { Topic, TopicFormValues } from '@/types/topic'

interface TopicContextValue {
  topics: Topic[]
  getById: (id: string) => Topic | undefined
  addTopic: (values: TopicFormValues) => Topic
  editTopic: (id: string, values: TopicFormValues) => Topic | null
  removeTopic: (id: string) => boolean
}

const TopicContext = createContext<TopicContextValue | null>(null)

export function TopicProvider({ children }: { children: ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics)

  const getById = useCallback((id: string) => getTopicById(topics, id), [topics])

  const addTopic = useCallback((values: TopicFormValues) => {
    let created!: Topic
    setTopics((current) => {
      created = createTopic(current, values)
      return [created, ...current]
    })
    return created
  }, [])

  const editTopic = useCallback((id: string, values: TopicFormValues) => {
    let updated: Topic | null = null
    setTopics((current) =>
      current.map((topic) => {
        if (topic.id !== id) {
          return topic
        }
        updated = updateTopic(topic, values)
        return updated
      }),
    )
    return updated
  }, [])

  const removeTopic = useCallback((id: string) => {
    let removed = false
    setTopics((current) => {
      const next = current.filter((topic) => topic.id !== id)
      removed = next.length !== current.length
      return next
    })
    return removed
  }, [])

  const value = useMemo(
    () => ({
      topics,
      getById,
      addTopic,
      editTopic,
      removeTopic,
    }),
    [topics, getById, addTopic, editTopic, removeTopic],
  )

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
}

export function useTopics() {
  const context = useContext(TopicContext)
  if (!context) {
    throw new Error('useTopics must be used within TopicProvider')
  }
  return context
}
