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