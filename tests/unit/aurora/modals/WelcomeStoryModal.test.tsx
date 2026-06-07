import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WelcomeStoryModal } from '../../../../src/features/aurora/modals/WelcomeStoryModal';

const noop = () => {};

describe('WelcomeStoryModal', () => {
  // INV-01: appears when initialStory is empty — the parent controls this via `open`.
  // INV-02: submitted story is trimmed.
  it('trims whitespace from the submitted story (INV-02)', () => {
    const onSubmit = vi.fn();
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={onSubmit}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    const textarea = screen.getByPlaceholderText(/Once upon a time/);
    fireEvent.change(textarea, { target: { value: '   A brave knight   ' } });
    fireEvent.click(screen.getByText('Start adventure'));

    expect(onSubmit).toHaveBeenCalledWith('A brave knight');
  });

  // INV-03: submit disabled until non-whitespace content is in the textarea.
  it('disables submit until the textarea has non-whitespace content (INV-03)', () => {
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    const submit = screen.getByText('Start adventure');
    expect(submit).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Once upon a time/);
    fireEvent.change(textarea, { target: { value: '   ' } });
    expect(submit).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'story' } });
    expect(submit).not.toBeDisabled();
  });

  // INV-04: 500-char browser cap enforced via maxLength.
  it('caps the textarea at 500 characters via maxLength (INV-04)', () => {
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    const textarea = screen.getByPlaceholderText(/Once upon a time/) as HTMLTextAreaElement;
    expect(textarea.maxLength).toBe(500);
  });

  // INV-06: "Give me ideas" is always rendered, disabled when no API key.
  it('renders "Give me ideas" disabled but visible when no onGetIdeas is wired (INV-06)', () => {
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={noop}
        hasApiKey={false}
      />
    );

    const ideasButton = screen.getByText(/Give me ideas/);
    expect(ideasButton).toBeInTheDocument();
    expect(ideasButton).toBeDisabled();
  });

  // INV-07: Start adventure disabled when hasApiKey is false, even with a valid story.
  it('disables Start adventure when hasApiKey is false even with a valid story (INV-07)', () => {
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={noop}
        hasApiKey={false}
      />
    );

    const textarea = screen.getByPlaceholderText(/Once upon a time/);
    fireEvent.change(textarea, { target: { value: 'A brave knight' } });
    expect(screen.getByText('Start adventure')).toBeDisabled();
  });

  // INV-10: clicking a static example chip fills the textarea with the full string.
  it('fills the textarea with the full example string when an example chip is clicked (INV-10)', () => {
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    const chip = screen.getByText('A brave knight searches for treasure…');
    fireEvent.click(chip);

    const textarea = screen.getByPlaceholderText(/Once upon a time/) as HTMLTextAreaElement;
    expect(textarea.value).toBe('A brave knight searches for treasure…');
  });

  // INV-10: clicking an AI idea chip fills the textarea with the full idea, not the truncated display text.
  it('fills the textarea with the full AI idea text even when the chip is truncated (INV-10)', async () => {
    const longIdea = 'A very long idea that should definitely exceed the forty character display truncation cap...';
    const onGetIdeas = vi.fn().mockResolvedValue([longIdea]);

    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onGetIdeas={onGetIdeas}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    fireEvent.click(screen.getByText(/Give me ideas/));
    await waitFor(() => screen.getByText(/A very long idea that should definitely/));

    // The displayed chip is truncated to 40 chars + ellipsis.
    const chip = screen.getByText(/^A very long idea that should definitely.…$/);
    fireEvent.click(chip);

    const textarea = screen.getByPlaceholderText(/Once upon a time/) as HTMLTextAreaElement;
    expect(textarea.value).toBe(longIdea);
  });

  // INV-11: errors from generateStoryIdeas are swallowed; loading state clears.
  it('swallows generateStoryIdeas errors and clears the loading state (INV-11)', async () => {
    const onGetIdeas = vi.fn().mockRejectedValue(new Error('network'));

    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onGetIdeas={onGetIdeas}
        onOpenSettings={noop}
        hasApiKey
      />
    );

    const button = screen.getByText(/Give me ideas/);
    fireEvent.click(button);

    // After the rejected promise settles, the button text returns to the idle label.
    await waitFor(() => expect(screen.getByText(/Give me ideas/)).toBeInTheDocument());
    expect(onGetIdeas).toHaveBeenCalled();
  });

  // The settings gear button is the only icon-only exception in the header.
  it('opens settings when the gear button is clicked', () => {
    const onOpenSettings = vi.fn();
    render(
      <WelcomeStoryModal
        open
        language="en"
        onSubmit={noop}
        onOpenSettings={onOpenSettings}
        hasApiKey
      />
    );

    fireEvent.click(screen.getByLabelText('Settings'));
    expect(onOpenSettings).toHaveBeenCalled();
  });
});
