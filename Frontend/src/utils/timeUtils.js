export const formatTimeIST = (timestamp) => {
  const date = new Date(timestamp);

  // Convert to IST (Indian Standard Time, UTC+5:30)
  const options = {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };

  return date.toLocaleTimeString('en-IN', options);
};

export const formatDateIST = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Convert to IST
  const options = {
    timeZone: 'Asia/Kolkata'
  };

  const dateIST = new Date(date.toLocaleString('en-US', options));
  const todayIST = new Date(today.toLocaleString('en-US', options));
  const yesterdayIST = new Date(yesterday.toLocaleString('en-US', options));

  if (dateIST.toDateString() === todayIST.toDateString()) {
    return 'Today';
  } else if (dateIST.toDateString() === yesterdayIST.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

export const formatLastSeen = (lastSeenTimestamp) => {
  if (!lastSeenTimestamp) return 'Never';

  const now = new Date();
  const lastSeen = new Date(lastSeenTimestamp);
  const diffMs = now - lastSeen;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  // For older timestamps, use date format
  return formatDateIST(lastSeenTimestamp) + ' at ' + formatTimeIST(lastSeenTimestamp);
};
