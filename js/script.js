// Referências principais dos elementos da interface
const screens = document.querySelectorAll('.screen');
const navButtons = document.querySelectorAll('[data-target]');
const backButton = document.getElementById('btn-back');
const homeButton = document.getElementById('btn-home');
const fontButton = document.getElementById('btn-font');
const toast = document.getElementById('toast');
const headerTitle = document.getElementById('app-title');
const appStatus = document.querySelector('.app-status');
const tabButtons = document.querySelectorAll('.screen-tabs button');

let navigationStack = ['home'];
let currentScreen = 'home';
let largeFontActive = false;

const screenTitles = {
  home: 'Escolha uma função',
  whatsapp: 'WhatsApp Fácil',
  ligacoes: 'Ligações Telefônicas',
  seguranca: 'Segurança Digital',
  internet: 'Internet Simples',
};

const screenStatuses = {
  home: 'Escolha uma função e siga o passo a passo com calma.',
  whatsapp: 'Siga os passos para enviar sua mensagem.',
  ligacoes: 'Faça chamadas com segurança.',
  seguranca: 'Proteja seus dados e evite golpes.',
  internet: 'Navegue em sites confiáveis com confiança.',
};

// Mostra mensagem breve na tela
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('visible');
  }, 2200);
}

function setActiveScreen(target) {
  screens.forEach((screen) => {
    screen.classList.toggle('active', screen.dataset.screen === target);
  });
}

function setTabState(screen, panelId) {
  const tabButtons = screen.querySelectorAll('.screen-tabs button');
  const panels = screen.querySelectorAll('.tab-panel');
  const badge = screen.querySelector('.screen-badge');

  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.panel === panelId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle('active', panel.id === panelId);
  });

  const badgeMap = {
    'whatsapp-open': '1',
    'whatsapp-write': '2',
    'whatsapp-send': '3',
    'ligacoes-fazer': '1',
    'ligacoes-receber': '2',
    'ligacoes-evitar': '3',
    'seguranca-check': '1',
    'seguranca-protect': '2',
    'seguranca-help': '3',
    'internet-open': '1',
    'internet-search': '2',
    'internet-close': '3',
  };

  if (badge) {
    badge.textContent = badgeMap[panelId] || '1';
  }
  updateStepButtons(screen);
}

function getPanelOrder(screen) {
  return Array.from(screen.querySelectorAll('.screen-tabs button')).map((button) => button.dataset.panel);
}

function updateStepButtons(screen) {
  if (!screen) return;
  const panelIds = getPanelOrder(screen);

  panelIds.forEach((panelId, index) => {
    const panel = screen.querySelector(`#${panelId}`);
    if (!panel) return;

    const prevButton = panel.querySelector('.step-prev');
    const nextButton = panel.querySelector('.step-next');

    if (prevButton) {
      prevButton.hidden = index <= 0;
    }

    if (nextButton) {
      nextButton.hidden = index >= panelIds.length - 1;
    }
  });
}

function moveStep(screen, offset) {
  const panelIds = getPanelOrder(screen);
  const activePanel = screen.querySelector('.tab-panel.active');
  if (!activePanel) return;

  const index = panelIds.indexOf(activePanel.id);
  const nextIndex = index + offset;

  if (nextIndex < 0 || nextIndex >= panelIds.length) return;
  setTabState(screen, panelIds[nextIndex]);
}

function ensureActiveTab(target) {
  const screen = document.querySelector(`.screen[data-screen="${target}"]`);
  if (!screen) return;

  const defaultButton = screen.querySelector('.screen-tabs button');
  const activeButton = screen.querySelector('.screen-tabs button.active') || defaultButton;

  if (activeButton) {
    setTabState(screen, activeButton.dataset.panel);
  }
}

function updateNavigationState(target) {
  backButton.hidden = target === 'home';
  headerTitle.textContent = 'Inclusão Digital';
  appStatus.textContent = screenStatuses[target] || 'Escolha uma função e siga o passo a passo.';
}

function navigateTo(target, options = {}) {
  if (!target || target === currentScreen) return;

  const previousScreen = currentScreen;
  setActiveScreen(target);
  ensureActiveTab(target);
  updateNavigationState(target);

  if (target === 'home' || options.reset) {
    navigationStack = ['home'];
  } else if (!options.fromHistory && previousScreen !== 'home') {
    navigationStack.push(previousScreen);
  }

  currentScreen = target;
}

function navigateHome() {
  if (currentScreen !== 'home') {
    navigateTo('home', { reset: true });
    showToast('Retornando ao início');
  }
}

function handleBack() {
  if (navigationStack.length > 1) {
    const previousScreen = navigationStack.pop();
    navigateTo(previousScreen, { fromHistory: true });
    return;
  }

  navigateHome();
}

function toggleFontSize() {
  largeFontActive = !largeFontActive;
  document.documentElement.style.fontSize = largeFontActive ? '22px' : '18px';
  fontButton.textContent = largeFontActive ? 'A-' : 'A+';
  fontButton.setAttribute('aria-label', largeFontActive ? 'Reduzir fonte' : 'Aumentar fonte');
  showToast(largeFontActive ? 'Fonte maior ativada' : 'Fonte padrão ativada');
}

function getScreenText(screen) {
  if (!screen) return '';

  const activePanel = screen.querySelector('.tab-panel.active') || screen;
  const nodes = Array.from(
    activePanel.querySelectorAll('h1, h2, h3, strong, li, p, span:not(.button-icon)')
  );

  return nodes
    .map((node) => node.innerText)
    .join(' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function initializeApp() {
  navButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      navigateTo(target);
    });
  });

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const screen = button.closest('.screen');
      if (!screen) return;
      setTabState(screen, button.dataset.panel);
    });
  });

  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('.step-button');
    if (!button) return;

    const screen = button.closest('.screen');
    if (!screen) return;

    if (button.classList.contains('step-home')) {
      navigateHome();
      return;
    }

    if (button.classList.contains('step-prev')) {
      moveStep(screen, -1);
      return;
    }

    if (button.classList.contains('step-next')) {
      moveStep(screen, 1);
      return;
    }
  });

  backButton.addEventListener('click', handleBack);
  fontButton.addEventListener('click', toggleFontSize);

  addStepControls();
  navigateTo('home', { reset: true });
}

function addStepControls() {
  document.querySelectorAll('.tab-panel').forEach((panel) => {
    const actions = panel.querySelector('.step-actions');

    if (actions) {
      if (!actions.querySelector('.step-home')) {
        const homeButton = document.createElement('button');
        homeButton.type = 'button';
        homeButton.className = 'step-button step-home';
        homeButton.textContent = 'Início';
        actions.insertBefore(homeButton, actions.firstChild);
      }
      return;
    }

    const newActions = document.createElement('div');
    newActions.className = 'step-actions';
    newActions.innerHTML = `
      <button type="button" class="step-button step-home">Início</button>
      <button type="button" class="step-button step-prev">Voltar</button>
      <button type="button" class="step-button step-next">Próximo</button>
    `;

    panel.appendChild(newActions);
  });
}

initializeApp();