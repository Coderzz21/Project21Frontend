import React, { useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import './EmojiPicker.css';

function EmojiPickerComponent({ showPicker, setShowPicker, onEmojiClick }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPicker, setShowPicker]);

  return (
    <div className="emoji-picker-container" ref={pickerRef}>
      <button
        type="button"
        className="emoji-btn"
        onClick={() => setShowPicker(!showPicker)}
      >
        😀
      </button>
      {showPicker && (
        <div className="emoji-picker-wrapper">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme="dark"
            width={320}
            height={400}
            searchPlaceHolder="Search emoji..."
            skinTonesDisabled
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  );
}

export default EmojiPickerComponent;