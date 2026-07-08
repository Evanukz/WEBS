// Flutterwave integration structure (placeholder)
// Later you can wire up create payment + callback verification.

function buildFlutterwavePayload({ amount, email, tx_ref, currency = 'NGN', customerName }) {
  return {
    tx_ref,
    amount,
    currency,
    customer: {
      email,
      name: customerName || email
    }
  };
}

async function verifyFlutterwaveCallback(_payload) {
  // TODO: verify signature with FLUTTERWAVE_SECRET
  return { ok: true };
}

export { buildFlutterwavePayload, verifyFlutterwaveCallback };

