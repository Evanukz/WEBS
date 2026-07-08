// Paystack integration structure (placeholder)
// Later you can wire up create payment + callback verification.

function buildPaystackPayload({ amount, email, reference, currency = 'NGN' }) {
  return {
    email,
    amount,
    currency,
    reference
  };
}

async function verifyPaystackCallback(_payload) {
  // TODO: verify signature with PAYSTACK_SECRET
  return { ok: true };
}

export { buildPaystackPayload, verifyPaystackCallback };

