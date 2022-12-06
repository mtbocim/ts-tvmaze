import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const TVMAZE_URL = 'https://api.tvmaze.com';
const MISSING_IMAGE_URL = "https://tinyurl.com/tv-missing";

interface ShowsFromApiInterface {
  id: number;
  name: string;
  summary: string;
  image: { medium: string } | null
}

interface ShowsInterface {
  id: number;
  name: string;
  summary: string;
  image: string
}

interface EpisodesInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowsInterface[]> {
  const res = await axios.get(
    `${TVMAZE_URL}/search/shows`,
    { params: { q: term } }
  );

  return res.data.map(
    (result: { show: ShowsFromApiInterface }): ShowsInterface => {
      const show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image?.medium || MISSING_IMAGE_URL
      }
    });
}



/** Given list of shows, create markup for each and add to DOM */

function populateShows(shows: ShowsInterface[]) {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term: string = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term)!;

  $episodesArea.hide();
  populateShows(shows);
}

//Event listener for search form submission
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** 
 * Given a show ID, get a list of episodes from API call
 * and return (promise) array of episodes:
 *      { id, name, season, number }
 */
async function getEpisodesOfShow(showId: number): Promise<EpisodesInterface[]> {
  let res = await axios.get(`${TVMAZE_URL}/shows/${showId}/episodes`);
  return res.data.map((result: EpisodesInterface) => {
    return {
      id: result.id,
      name: result.name,
      season: result.season,
      number: result.number
    }
  });
}

/** 
 * Given an array of episodes, populates episode list part of DOM 
 */
function populateEpisodes(episodes: EpisodesInterface[]) {
  $("#episodesList").empty();
  for (let ep of episodes) {
    let description = `<li>${ep.name} (${ep.season}, ${ep.number})</li>`
    $("#episodesList").append(description);
  }
}

//Event handler for Episodes button click
$("#showsList").on("click", ".btn", handleButtonClick);

/**
 * Calls populateEpisodes with the return value of getEpisodesOfShow,
 * and then calls displayEpisodesOfShow.
 */
async function handleButtonClick(evt: JQuery.ClickEvent) {
  evt.preventDefault();
  let $button = $(evt.currentTarget);
  //debugger;
  let showId = $($button).closest(".Show").data("show-id");
  populateEpisodes(await getEpisodesOfShow(showId));

  displayEpisodesOfShow();
}

/**Displays episodeArea */
function displayEpisodesOfShow(): void {
  $("#episodesArea").removeAttr("style");
}