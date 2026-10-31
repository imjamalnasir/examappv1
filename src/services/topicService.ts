import type { Topic, TopicFormValues } from '@/types/topic'
import { createSequentialId } from '@/utils/id'
import { todayDateString } from '@/utils/format'

export function getTopicById(topics: Topic[], id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id)
}

export function sortTopicsByDisplayOrder(topics: Topic[]): Topic[] {
  return [...topics].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) {
      return a.displayOrder - b.displayOrder
    }
    return a.name.localeCompare(b.name)
  })
}

export function createTopic(topics: Topic[], values: TopicFormValues): Topic {
  return {
    id: createSequentialId(
      'TOP',
      topics.map((topic) => topic.id),
    ),
    name: values.name.trim(),
    subjectId: values.subjectId,
    description: values.description.trim(),
    displayOrder: Number(values.displayOrder),
    status: values.status,
    createdDate: todayDateString(),
  }
}

export function updateTopic(topic: Topic, values: TopicFormValues): Topic {
  return {
    ...topic,
    name: values.name.trim(),
    subjectId: values.subjectId,
    description: values.description.trim(),
    displayOrder: Number(values.displayOrder),
    status: values.status,
  }
}
