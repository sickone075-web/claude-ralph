export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: number;
  passes: boolean;
  notes: string;
}

export interface PRD {
  project: string;
  branchName: string;
  description: string;
  userStories: Story[];
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
