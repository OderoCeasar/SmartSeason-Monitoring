export function formatDate(value, options = { dateStyle: 'medium' }) {
  if (!value) {
    return 'No updates yet';
  }

  return new Intl.DateTimeFormat('en-US', options).format(new Date(value));
}
