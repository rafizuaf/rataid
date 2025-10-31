import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { CreateProductForm } from '../../catalog/CreateProductForm';

describe('CreateProductForm', () => {
  test('shows field errors for required inputs', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateProductForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /create product/i }));
    expect(await screen.findAllByText(/is required/i)).toHaveLength(2);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('submits valid values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<CreateProductForm isSubmitting={false} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/sku/i), 'SKU-1');
    await user.type(screen.getByLabelText(/product name/i), 'Prod 1');
    await user.type(screen.getByLabelText(/price \(cents\)/i), '100');
    await user.click(screen.getByRole('button', { name: /create product/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const arg = onSubmit.mock.calls[0][0];
    expect(arg).toMatchObject({ sku: 'SKU-1', name: 'Prod 1', priceCents: 100, currency: 'USD' });
  });
});