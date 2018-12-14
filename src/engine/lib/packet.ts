interface BuildMessageReturn {
  type: 'message';
  message: string;
}

export function buildMessage(message: string): BuildMessageReturn {
  return {
    type: 'message',
    message,
  };
}
