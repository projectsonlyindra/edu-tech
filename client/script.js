// ==========================================================================
// EduTech Institute — Landing Page & AI Chatbot Interaction Scripts
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------
  // 1. Mobile Navigation Menu Toggle
  // -------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking nav links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }

  // -------------------------------------------------------------
  // 2. Chat Popup Modal Controls
  // -------------------------------------------------------------
  const popupContainer = document.getElementById('chat-popup-container');
  const popupWindow = document.getElementById('chat-popup-window');
  const btnFloatingChat = document.getElementById('floating-chat-btn');
  const btnCloseChat = document.getElementById('btn-close-chat');
  const btnClearChat = document.getElementById('btn-clear-chat');
  const btnNavChat = document.getElementById('btn-open-chat-nav');
  const btnHeroChat = document.getElementById('btn-hero-chat');
  const btnTriggerBanner = document.getElementById('btn-trigger-popup-cta');
  const userInput = document.getElementById('user-input');

  function openChatPopup() {
    if (popupContainer) {
      popupContainer.classList.add('open');
      if (popupWindow) popupWindow.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        if (userInput) userInput.focus();
      }, 250);
    }
  }

  function closeChatPopup() {
    if (popupContainer) {
      popupContainer.classList.remove('open');
      if (popupWindow) popupWindow.setAttribute('aria-hidden', 'true');
    }
  }

  function toggleChatPopup() {
    if (popupContainer && popupContainer.classList.contains('open')) {
      closeChatPopup();
    } else {
      openChatPopup();
    }
  }

  // Pasang event listener untuk membuka/menutup popup
  if (btnFloatingChat) btnFloatingChat.addEventListener('click', toggleChatPopup);
  if (btnCloseChat) btnCloseChat.addEventListener('click', closeChatPopup);
  if (btnNavChat) btnNavChat.addEventListener('click', openChatPopup);
  if (btnHeroChat) btnHeroChat.addEventListener('click', openChatPopup);
  if (btnTriggerBanner) btnTriggerBanner.addEventListener('click', openChatPopup);

  // Tutup popup dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popupContainer && popupContainer.classList.contains('open')) {
      closeChatPopup();
    }
  });

  // -------------------------------------------------------------
  // 3. Gemini AI Chatbot Integration (Multi-Turn with LocalStorage)
  // -------------------------------------------------------------
  const chatForm = document.getElementById('chat-form');
  const chatBox = document.getElementById('chat-box');
  const submitBtn = document.getElementById('btn-submit-chat');
  const quickPromptChips = document.querySelectorAll('.qp-chip');

  // Key untuk penyimpanan riwayat percakapan di browser localStorage
  const STORAGE_KEY = 'edutech_chat_history_v1';
  const initialGreeting = "Halo! Saya asisten AI resmi EduTech. Saya siap membantu menjawab pertanyaan Anda seputar kurikulum berbasis AI, program studi unggulan, fasilitas kampus, maupun pendaftaran mahasiswa baru. Ada yang ingin Anda ketahui?";

  // Muat riwayat dari localStorage atau gunakan default
  function loadConversationHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gagal membaca history chat dari localStorage:', err);
    }
    return [{ role: 'model', text: initialGreeting }];
  }

  // Simpan riwayat saat ini ke localStorage
  function saveConversationHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
    } catch (err) {
      console.warn('Gagal menyimpan history chat ke localStorage:', err);
    }
  }

  // Render seluruh percakapan ke UI chatBox
  function renderConversation() {
    if (!chatBox) return;
    chatBox.innerHTML = '';
    conversation.forEach(msg => {
      const sender = msg.role === 'user' ? 'user' : 'bot';
      appendMessage(sender, msg.text, false);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Inisialisasi percakapan
  const conversation = loadConversationHistory();
  renderConversation();

  // Tombol Hapus Riwayat Chat
  if (btnClearChat) {
    btnClearChat.addEventListener('click', () => {
      if (confirm('Hapus seluruh riwayat percakapan Anda dengan EduTech AI Assistant?')) {
        conversation.length = 0;
        conversation.push({ role: 'model', text: initialGreeting });
        saveConversationHistory();
        renderConversation();
      }
    });
  }

  // URL backend endpoint /api/chat
  const API_URL = window.location.origin.includes(':3000')
    ? '/api/chat'
    : 'http://localhost:3000/api/chat';

  // Handler pengiriman pesan chat
  async function sendMessage(text) {
    const userMessage = text.trim();
    if (!userMessage) return;

    // Pastikan modal popup terbuka saat mengirim pesan
    openChatPopup();

    // Tampilkan pesan pengguna di UI
    appendMessage('user', userMessage);

    // Tambahkan ke riwayat percakapan & simpan ke localStorage
    conversation.push({ role: 'user', text: userMessage });
    saveConversationHistory();
    if (userInput) userInput.value = '';

    // Nonaktifkan form selama menunggu respon
    if (userInput) userInput.disabled = true;
    if (submitBtn) submitBtn.disabled = true;

    // Tampilkan indikator proses / loading
    const loadingElement = appendMessage('bot loading', 'AI sedang menyusun jawaban...');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conversation })
      });

      const data = await response.json();

      // Hapus status loading
      if (loadingElement) loadingElement.remove();

      if (!response.ok) {
        throw new Error(data.message || `Gagal menghubungi server (status: ${response.status})`);
      }

      const botReply = data.result || 'Terima kasih atas pertanyaan Anda.';

      // Tampilkan balasan AI
      appendMessage('bot', botReply);

      // Simpan balasan ke riwayat percakapan & perbarui localStorage
      conversation.push({ role: 'model', text: botReply });
      saveConversationHistory();

    } catch (error) {
      if (loadingElement) loadingElement.remove();
      console.error('Chat error:', error);
      appendMessage('error', `Maaf, terjadi kendala: ${error.message}`);
      // Hapus pesan pengguna terakhir dari riwayat jika request gagal
      conversation.pop();
      saveConversationHistory();
    } finally {
      if (userInput) {
        userInput.disabled = false;
        userInput.focus();
      }
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // Event listener submit form chat
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (userInput) {
        sendMessage(userInput.value);
      }
    });
  }

  // Event listener untuk Quick Prompt Chips
  quickPromptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        if (userInput) userInput.value = promptText;
        sendMessage(promptText);
      }
    });
  });

  // Fungsi pembantu menampilkan pesan di chat box
  function appendMessage(sender, text, shouldScroll = true) {
    if (!chatBox) return null;

    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);

    // Scroll otomatis ke pesan terbaru jika diminta
    if (shouldScroll) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    return msg;
  }
});
