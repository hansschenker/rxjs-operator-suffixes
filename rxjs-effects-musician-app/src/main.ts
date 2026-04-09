import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  fromEvent,
  map,
} from "rxjs";
import { musiciansApp, Musician, musiciansLoadedFailure } from "./musicians-app";
import "./index.css";
import "./App.css";
import "./styles/MusicianCard.css";
import "./styles/MusiciansList.css";
import "./styles/SearchBar.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

const app = document.createElement("div");
app.className = "App";

const header = document.createElement("header");
header.className = "page-header";
header.innerHTML = `
  <h1>🎸 Musicians App</h1>
  <p>Discover amazing musicians using RxJS Effects</p>
`;

// Search Bar
const searchBar = document.createElement("div");
searchBar.className = "search-bar";

const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Search musicians...";
searchInput.className = "search-input";
searchInput.setAttribute("aria-label", "Search musicians");

const searchIcon = document.createElement("div");
searchIcon.className = "search-icon";
searchIcon.textContent = "🔍";

searchBar.append(searchInput, searchIcon);

// Error Trigger Button (New Feature)
const errorButton = document.createElement("button");
errorButton.textContent = "⚠️ Trigger Error";
errorButton.style.marginTop = "1rem";
errorButton.style.backgroundColor = "#d32f2f";
errorButton.style.color = "white";
errorButton.onclick = () => {
  // Manually dispatch failure for testing
  musiciansApp.dispatcher.next(musiciansLoadedFailure({ message: "Simulated Error for Testing" }));
};
header.append(errorButton);


const content = document.createElement("div");
content.className = "musicians-content";

const listContainer = document.createElement("div");
listContainer.className = "musicians-list";

const selectionContainer = document.createElement("div");
selectionContainer.className = "musician-selection";

content.append(listContainer, selectionContainer);

const page = document.createElement("div");
page.className = "musicians-page";
page.append(header, searchBar, content);

app.append(page);
root.append(app);

// State
const selectedMusicianId$ = new BehaviorSubject<number | null>(null);
let lastListState:
  | {
    ids: number[];
    selectedId: number | null;
    isLoading: boolean;
    error: string | null;
  }
  | null = null;
let lastSelectedMusicianId: number | null = null;

const createFallbackImage = (name: string) => {
  const safeName = name.trim() || "Unknown Musician";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" role="img" aria-label="${safeName}">
      <rect width="100%" height="100%" fill="#1f2937" />
      <text x="50%" y="50%" fill="#f9fafb" font-size="20" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="middle">
        ${safeName}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

// Keep track of rendered list to avoid full rebuilds
let lastRenderedMusicianIds: number[] = [];
let lastRenderedSelectionId: number | null | undefined = undefined;

const renderList = (
  musicians: Musician[],
  selectedMusicianId: number | null,
  isLoading: boolean,
  error: string | null
) => {
  // 1. Handle Error
  if (error) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const errorState = document.createElement("div");
    errorState.className = "empty-state";
    errorState.setAttribute("role", "alert");
    errorState.innerHTML = `<p style="color: #ef5350">❌ ${error}</p>`;
    listContainer.append(errorState);
    return;
  }

  // 2. Handle Loading
  if (isLoading) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const loading = document.createElement("div");
    loading.className = "loading-container";
    loading.setAttribute("role", "status");
    loading.setAttribute("aria-live", "polite");
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <p>Loading musicians...</p>
    `;
    listContainer.append(loading);
    return;
  }

  // 3. Handle Empty
  if (musicians.length === 0) {
    listContainer.innerHTML = "";
    lastRenderedMusicianIds = [];
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<p>No musicians found. Try adjusting your search.</p>`;
    listContainer.append(empty);
    return;
  }

  // 4. Handle List Rendering
  // Check if data changed enough to require full rebuild
  const newIds = musicians.map(m => m.id);
  const dataChanged = newIds.length !== lastRenderedMusicianIds.length ||
    newIds.some((id, i) => id !== lastRenderedMusicianIds[i]);

  if (dataChanged) {
    // Rebuild list
    listContainer.innerHTML = "";
    const list = document.createElement("ul");
    list.className = "musicians-list-items";

    musicians.forEach((musician, index) => {
      const listItem = document.createElement("li");
      listItem.className = "musicians-list-item";
      // Stagger animation
      listItem.style.animationDelay = `${index * 0.05}s`;

      const button = document.createElement("button");
      button.id = `musician-btn-${musician.id}`;
      button.type = "button";
      button.className = "musicians-list-button";

      const name = document.createElement("span");
      name.className = "musician-list-name";
      name.textContent = musician.name;

      const id = document.createElement("span");
      id.className = "musician-list-id";
      id.textContent = `ID: ${musician.id}`;

      // DELETE BUTTON (New Feature UI)
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "delete-btn";
      deleteBtn.style.marginLeft = "auto";
      deleteBtn.onclick = (e) => {
        e.stopPropagation(); // prevent selection
        musiciansApp.dispatch.deleteMusician(musician.id);
      };

      // Wrap content to allow delete button on right? 
      // Current button structure is just name and id.
      // We might need to adjust structure.
      // For now, I'll just append deleteBtn to the main button? No, that's nesting buttons.
      // I should insert deleteBtn *after* the main button or restructure.
      // But preserving existing structure...
      // Let's add it to the button for now and hope styling handles it or just use a span for the click area?
      // Since `button` is the container, I shouldn't put another button inside.
      // I'll make the delete button a sibling of `button` and wrap them.
      // But loop creates `listItem`.
      // I will restructure slightly: listItem -> [Action Button(Select), Delete Button]

      // Update: Restoring original structure and adding delete button separately
      const containerDiv = document.createElement("div");
      containerDiv.style.display = "flex";
      containerDiv.style.alignItems = "center";
      containerDiv.style.width = "100%";
      containerDiv.style.gap = "8px";

      // Fix class of main button to not take full width if flex
      button.style.flex = "1";

      button.append(name, id);
      button.addEventListener("click", () => {
        selectedMusicianId$.next(musician.id);
      });

      containerDiv.append(button, deleteBtn);
      listItem.innerHTML = ""; // clear
      listItem.append(containerDiv);
      list.append(listItem);
    });
    listContainer.append(list);
    lastRenderedMusicianIds = newIds;
  }

  // 5. Update Selection (always run)
  const filteredIds = musicians.map((musician) => musician.id);
  const shouldRenderList =
    !lastListState ||
    lastListState.isLoading !== isLoading ||
    lastListState.error !== error ||
    lastListState.selectedId !== selectedMusicianId ||
    lastListState.ids.length !== filteredIds.length ||
    lastListState.ids.some((id, index) => id !== filteredIds[index]);

  if (shouldRenderList) {
    // Logic for selection highlighting
    // Remove old
    const previousSelected = listContainer.querySelector(".musicians-list-button.is-selected");
    if (previousSelected) {
      previousSelected.classList.remove("is-selected");
      previousSelected.setAttribute("aria-pressed", "false");
    }

    // Add new
    if (selectedMusicianId) {
      const newSelected = listContainer.querySelector(`#musician-btn-${selectedMusicianId}`);
      if (newSelected) {
        newSelected.classList.add("is-selected");
        newSelected.setAttribute("aria-pressed", "true");
      }
    }

    lastListState = {
      ids: filteredIds,
      selectedId: selectedMusicianId,
      isLoading: isLoading,
      error: error,
    };
  }
};

const renderSelection = (musician: Musician | null) => {
  const newId = musician ? musician.id : null;
  if (newId === lastRenderedSelectionId) {
    return;
  }
  lastRenderedSelectionId = newId;
  selectionContainer.innerHTML = "";

  if (!musician) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = `<p>Select a musician to see their profile.</p>`;
    selectionContainer.append(empty);
    return;
  }

  const card = document.createElement("div");
  card.className = "musician-card";
  // Add entrance animation
  card.animate([
    { opacity: 0, transform: 'translateY(10px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ], { duration: 300, easing: 'ease-out' });

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "musician-image";

  const image = document.createElement("img");
  image.src = musician.photoUrl;
  image.alt = musician.name;

  const handleImageError = () => {
    image.removeEventListener("error", handleImageError);
    image.src = createFallbackImage(musician.name);
  };
  image.addEventListener("error", handleImageError);

  imageWrapper.append(image);

  const info = document.createElement("div");
  info.className = "musician-info";

  const name = document.createElement("h3");
  name.className = "musician-name";
  name.textContent = musician.name;

  const id = document.createElement("p");
  id.className = "musician-id";
  id.textContent = `ID: ${musician.id}`;

  info.append(name, id);
  card.append(imageWrapper, info);
  selectionContainer.append(card);
};

const resolveSelection = (
  musicians: Musician[],
  current: number | null
): number | null => {
  if (musicians.length === 0) {
    return null;
  }

  if (current !== null && musicians.some((musician) => musician.id === current)) {
    return current;
  }

  return musicians[0].id; // Default to first
};

const stateSubscription = combineLatest([
  musiciansApp.state$,
  selectedMusicianId$.pipe(distinctUntilChanged()),
]).subscribe(([state, selectedId]) => {
  if (searchInput.value !== state.query) {
    searchInput.value = state.query;
  }

  // Auto-selection using resolveSelection
  const nextSelectedId = resolveSelection(state.musicians, selectedId);
  if (nextSelectedId !== selectedId) {
    // Update stream but don't force loop if already correct
    // Actually we need to update our local behavior subject if it drifted
    // But `resolveSelection` just calculates based on current *list* state.
    // If the list changed (e.g. filtered), our selection might need to jump.
    selectedMusicianId$.next(nextSelectedId);
    // Return early to wait for next emission with correct ID? 
    // Or render current?
    // If we next() here, `combineLatest` might fire again?
    // Yes, `selectedMusicianId$` will emit.
    return;
  }

  const query = state.query.toLowerCase();
  const filteredMusicians = state.musicians.filter((musician) =>
    musician.name.toLowerCase().includes(query)
  );

  renderList(filteredMusicians, selectedId, state.isLoading, state.error);

  if (lastSelectedMusicianId !== selectedId) {
    const selected = state.musicians.find(
      (musician) => musician.id === selectedId
    );
    renderSelection(selected ?? null);
    lastSelectedMusicianId = selectedId;
  }
});

// Search Input Logic
fromEvent(searchInput, "input")
  .pipe(
    map((event) => (event.target as HTMLInputElement).value),
    debounceTime(300),
    distinctUntilChanged()
  )
  .subscribe((query) => {
    musiciansApp.dispatch.queryChanged(query);
  });

// Cleanup
window.addEventListener("beforeunload", () => {
  stateSubscription.unsubscribe();
  musiciansApp.cleanup();
});

// Init
musiciansApp.initializeEffects();
musiciansApp.dispatch.pageOpened();
