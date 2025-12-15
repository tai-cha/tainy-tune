import type { Meta, StoryObj } from '@storybook-vue/nuxt';
import JournalCard from './JournalCard.vue';

const meta: Meta<typeof JournalCard> = {
  title: 'Components/JournalCard',
  component: JournalCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof JournalCard>;

export const Default: Story = {
  args: {
    journal: {
      id: 1,
      content: 'This is a sample journal entry for Storybook testing.',
      mood_score: 8,
      tags: ['test', 'storybook'],
      distortion_tags: [],
      advice: 'Keep up the good work!',
      created_at: new Date().toISOString(),
    },
  },
};

export const WithDistortions: Story = {
  args: {
    journal: {
      id: 2,
      content: 'I feel like everyone is ignoring me.',
      mood_score: 3,
      tags: ['anxiety'],
      distortion_tags: ['Mind Reading', 'Overgeneralization'],
      advice: 'Try to ask for clarification instead of assuming.',
      created_at: new Date().toISOString(),
    },
  },
};
