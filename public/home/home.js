// home.js - Dashboard Data Fetching and UI Rendering

// Base paths for the JSON database files
const DB_PATHS = {
  projects: '../../database/tickets/projects/active_projects.json',
  epics: '../../database/tickets/epics/active_epics.json',
  cards: '../../database/tickets/cards/active_cards.json',
  users: '../../database/users/active_users.json',
  statuses: '../../database/tickets/statuses.json' // Assuming statuses are static or mapped similarly
};

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

/**
 * Main initializer function to coordinate data fetching and rendering
 */
async function initDashboard() {
  try {
    // 1. Fetch all data concurrently
    const [projectsData, epicsData, cardsData, usersData] = await Promise.all([
      fetchData(DB_PATHS.projects),
      fetchData(DB_PATHS.epics),
      fetchData(DB_PATHS.cards),
      fetchData(DB_PATHS.users)
    ]);

    // Extract arrays or fallback to empty lists if null/empty
    const projects = projectsData?.projects || [];
    const epics = epicsData?.epics || [];
    const cards = cardsData?.cards || [];
    const users = usersData?.users || [];

    // 2. Render Metrics (Row 1)
    renderMetrics(projects, cards);

    // 3. Render Core Workload & Communication (Row 2)
    renderProjectsFeed(projects);
    renderInboxPreview(cards);

    // 4. Render Human Elements (Row 3)
    renderTeamAndContributors(users);

  } catch (error) {
    console.error('Failed to initialize dashboard:', error);
  }
}

/**
 * Generic helper function to fetch and parse JSON data safely
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (e) {
    console.warn(`Could not fetch data from ${url}:`, e);
    return null;
  }
}

/**
 * Row 1: Updates the high-level metric cards
 */
function renderMetrics(projects, cards) {
  const activeProjectsCountEl = document.querySelector('.metric-card:nth-child(1) .metric-value');
  const activeWorkItemsCountEl = document.querySelector('.metric-card:nth-child(2) .metric-value');

  if (activeProjectsCountEl) {
    activeProjectsCountEl.textContent = projects.length;
  }

  if (activeWorkItemsCountEl) {
    // Active cards are those not sitting in "Done" (6) or "Archive" (7)
    const activeCards = cards.filter(card => card.current_status_id !== 6 && card.current_status_id !== 7);
    activeWorkItemsCountEl.textContent = activeCards.length;
  }
}

/**
 * Row 2: Injects active projects into the main feed list
 */
function renderProjectsFeed(projects) {
  const projectListEl = document.querySelector('.project-list');
  if (!projectListEl) return;

  projectListEl.innerHTML = ''; // Clear skeleton/placeholders

  if (projects.length === 0) {
    projectListEl.innerHTML = '<li>No active projects found.</li>';
    return;
  }

  projects.forEach(project => {
    const li = document.createElement('li');
    li.className = 'project-item';
    li.innerHTML = `
      <strong>${project.name || 'Untitled Project'}</strong>
      <p>${project.description || 'No description provided.'}</p>
    `;
    projectListEl.appendChild(li);
  });
}

/**
 * Row 2: Filters and displays items marked with "Inbox" status (status_id = 1)
 */
function renderInboxPreview(cards) {
  const inboxListEl = document.querySelector('.inbox-list');
  if (!inboxListEl) return;

  inboxListEl.innerHTML = '';

  // Filter cards where current_status_id is 1 (Inbox)
  const inboxCards = cards.filter(card => card.current_status_id === 1);

  if (inboxCards.length === 0) {
    inboxListEl.innerHTML = '<li>Inbox is clear!</li>';
    return;
  }

  inboxCards.forEach(card => {
    const li = document.createElement('li');
    li.className = 'inbox-item';
    li.innerHTML = `
      <div class="inbox-item-title">${card.title || 'Untitled Card'}</div>
      <small>${card.dept ? `[${card.dept}]` : ''} ${card.description || ''}</small>
    `;
    inboxListEl.appendChild(li);
  });
}

/**
 * Row 3: Renders user names and creates avatar circles
 */
function renderTeamAndContributors(users) {
  const teamListEl = document.querySelector('.team-list-items');
  const contributorAvatarsEl = document.querySelector('.contributor-avatars');

  if (teamListEl) {
    teamListEl.innerHTML = '';
    if (users.length === 0) {
      teamListEl.innerHTML = '<li>No members found.</li>';
    } else {
      users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.name || `User ID: ${user.id}`;
        teamListEl.appendChild(li);
      });
    }
  }

  if (contributorAvatarsEl) {
    contributorAvatarsEl.innerHTML = '';
    users.forEach(user => {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      // Compute simple initials
      const initials = (user.name || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      avatar.textContent = initials;
      avatar.title = user.name || 'Unknown User'; // Tooltip on hover
      
      // Inline styling backup for avatars if needed
      avatar.style.display = 'inline-flex';
      avatar.style.alignItems = 'center';
      avatar.style.justifyContent = 'center';
      avatar.style.borderRadius = '50%';
      avatar.style.width = '35px';
      avatar.style.height = '35px';
      avatar.style.marginRight = '8px';
      avatar.style.backgroundColor = '#4f46e5';
      avatar.style.color = '#ffffff';
      avatar.style.fontSize = '12px';
      avatar.style.fontWeight = 'bold';

      contributorAvatarsEl.appendChild(avatar);
    });
  }
}