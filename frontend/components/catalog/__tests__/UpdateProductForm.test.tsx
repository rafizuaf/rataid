import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { UpdateProductForm } from '../../catalog/UpdateProductForm';

describe('UpdateProductForm', () => {
  test('requires ID to submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<UpdateProductForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /update product/i }));
    expect(await screen.findByText(/product id is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});