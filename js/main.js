/**
 * ==========================================================================
 * MINT Daily Reward System - Client Script (GTA SAMP CEF Environment)
 * ==========================================================================
 * Modular Architecture:
 * 1. Timer Controller (Countdown logic)
 * 2. Claim Reward Controller (Day 2 Active Card -> Claimed)
 * 3. Expired Warning Controller (Day 1 Shake & Error Modal)
 * 4. Modal & Popup Manager (Open/Close, Success & Expired dialogs)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const modalWrapper = document.getElementById('dailyRewardModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const reopenPrompt = document.getElementById('reopenPrompt');
  const countdownEl = document.getElementById('countdown');

  // Popup Elements
  const popupOverlay = document.getElementById('popupOverlay');
  const successPopupCard = document.getElementById('successPopup');
  const errorPopupCard = document.getElementById('errorPopup');
  const btnSuccessOk = document.getElementById('btnSuccessOk');
  const btnErrorOk = document.getElementById('btnErrorOk');

  // Reward Cards & Elements
  const day1Card = document.getElementById('card-day-1');
  const day2Card = document.getElementById('card-day-2');
  const day2ClaimBtn = document.getElementById('btn-claim-day2');
  const streakCountEl = document.getElementById('streakCount');
  const streakProgressEl = document.getElementById('streakProgressFill');

  // ==========================================================================
  // SECTION A: COUNTDOWN TIMER LOGIC
  // ==========================================================================
  /**
   * Initializes countdown timer from starting seconds and updates #countdown element
   * @param {number} startSeconds 
   */
  function initCountdownTimer(startSeconds = 86400) {
    let time = startSeconds;

    function renderTime() {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = time % 60;

      const formatted = [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0')
      ].join(':');

      if (countdownEl) {
        countdownEl.textContent = formatted;
      }
    }

    // Initial render
    renderTime();

    const timerInterval = setInterval(() => {
      if (time > 0) {
        time--;
        renderTime();
      } else {
        clearInterval(timerInterval);
        if (countdownEl) {
          countdownEl.textContent = '00:00:00';
        }
      }
    }, 1000);
  }

  // ==========================================================================
  // SECTION B: POPUP DIALOG CONTROLLER
  // ==========================================================================
  /**
   * Displays the modal popup with designated type
   * @param {'success' | 'error'} type 
   */
  function showPopup(type) {
    if (!popupOverlay) return;

    if (type === 'success') {
      successPopupCard.style.display = 'flex';
      errorPopupCard.style.display = 'none';
    } else {
      successPopupCard.style.display = 'none';
      errorPopupCard.style.display = 'flex';
    }

    popupOverlay.classList.add('show');
  }

  function hidePopup() {
    if (!popupOverlay) return;
    popupOverlay.classList.remove('show');
  }

  if (btnSuccessOk) {
    btnSuccessOk.addEventListener('click', hidePopup);
  }
  if (btnErrorOk) {
    btnErrorOk.addEventListener('click', hidePopup);
  }
  if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) {
        hidePopup();
      }
    });
  }

  // ==========================================================================
  // SECTION C: CLAIM REWARD LOGIC (DAY 2 ACTIVE)
  // ==========================================================================
  let isDay2Claimed = false;

  function handleClaimDay2(e) {
    if (e) e.stopPropagation();
    if (isDay2Claimed || !day2Card) return;

    isDay2Claimed = true;

    // 1. Remove active state class, add claimed state class
    day2Card.classList.remove('state-active');
    day2Card.classList.add('state-claimed');

    // 2. Change border to var(--mint) and background to var(--mint-light)
    day2Card.style.borderColor = 'var(--mint)';
    day2Card.style.backgroundColor = 'var(--mint-light)';

    // 3. Remove Claim button HTML
    if (day2ClaimBtn && day2ClaimBtn.parentNode) {
      day2ClaimBtn.parentNode.removeChild(day2ClaimBtn);
    }

    // 4. Inject checkmark SVG icon in the top right
    const topIconContainer = day2Card.querySelector('.card-top-icon');
    if (topIconContainer) {
      topIconContainer.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-label="Claimed">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;
    }

    // 5. Inject "Claimed" status badge
    const badgeContainer = day2Card.querySelector('.card-badge-container');
    if (badgeContainer) {
      badgeContainer.innerHTML = `<span class="badge-claimed">Claimed</span>`;
    }

    // 6. Update streak to 2 / 7 Days and adjust progress bar fill
    if (streakCountEl) {
      streakCountEl.textContent = '2 / 7 Days';
    }
    if (streakProgressEl) {
      streakProgressEl.style.width = '29%';
    }

    // 7. Trigger Success Popup after 200ms
    setTimeout(() => {
      showPopup('success');
    }, 200);
  }

  if (day2ClaimBtn) {
    day2ClaimBtn.addEventListener('click', handleClaimDay2);
  }
  if (day2Card) {
    day2Card.addEventListener('click', () => {
      if (!isDay2Claimed) {
        handleClaimDay2();
      }
    });
  }

  // ==========================================================================
  // SECTION D: EXPIRED CARD LOGIC (DAY 1)
  // ==========================================================================
  if (day1Card) {
    day1Card.addEventListener('click', () => {
      // 1. Add shake CSS animation class
      day1Card.classList.remove('shake');
      // Trigger reflow to restart animation if clicked repeatedly
      void day1Card.offsetWidth;
      day1Card.classList.add('shake');

      // Remove shake class after 400ms duration
      setTimeout(() => {
        day1Card.classList.remove('shake');
      }, 400);

      // 2. Trigger Error Popup
      showPopup('error');
    });
  }

  // ==========================================================================
  // SECTION E: CLOSE UI LOGIC
  // ==========================================================================
  function closeDailyRewardModal() {
    if (modalWrapper) {
      modalWrapper.classList.add('hidden-modal');
    }
    if (reopenPrompt) {
      reopenPrompt.classList.add('visible');
    }
    // SAMP CEF callback hook (for real GTA SAMP pawn scripting)
    if (window.samp && typeof window.samp.emit === 'function') {
      window.samp.emit('dailyReward:close');
    }
  }

  function reopenDailyRewardModal() {
    if (modalWrapper) {
      modalWrapper.classList.remove('hidden-modal');
    }
    if (reopenPrompt) {
      reopenPrompt.classList.remove('visible');
    }
    if (window.samp && typeof window.samp.emit === 'function') {
      window.samp.emit('dailyReward:open');
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDailyRewardModal);
  }
  if (reopenPrompt) {
    reopenPrompt.addEventListener('click', reopenDailyRewardModal);
  }

  // Keyboard shortcut: Escape closes or reopens
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (popupOverlay && popupOverlay.classList.contains('show')) {
        hidePopup();
      } else if (modalWrapper && !modalWrapper.classList.contains('hidden-modal')) {
        closeDailyRewardModal();
      } else {
        reopenDailyRewardModal();
      }
    }
  });

  // Start the countdown timer
  initCountdownTimer(86400);
});
