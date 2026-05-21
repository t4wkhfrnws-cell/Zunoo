/* ============================================================
   ZUUNO — script.js

   Milestone 2: The Moving Engine.
   Feature added in this version: bottom tab-bar navigation.
   Only one screen shows at a time; clicking a tab switches to it.

   RESERVED HTML IDs — do not rename these. The JavaScript attaches
   event listeners to them:

     Layout / navigation
       app-header, app-main, tabbar
       tab-chatbot, tab-providers, tab-pharmacy, tab-trials, tab-resources
       screen-chatbot, screen-providers, screen-pharmacy,
       screen-trials, screen-resources
       premium-btn, settings-btn

     Chatbot screen
       chat-stream, suggested-prompts, condition-select,
       chat-input, chat-send

     Providers screen
       provider-location, provider-radius, provider-filter-btn, provider-map

     Pharmacy screen
       med-check-input, med-check-btn, pharmacy-kinds, pharmacy-map

     Trials screen
       trial-search, trial-search-btn

     Resources screen
       resource-search, resource-categories
   ============================================================ */

(function () {
  "use strict";

  var tabs = document.querySelectorAll(".tab");
  var screens = document.querySelectorAll(".screen");

  /* Show one screen, hide the rest, and highlight the matching tab.
     Screens are shown/hidden with the CSS class "active" so the layout
     stays correct even before this script runs. */
  function showScreen(targetId) {
    screens.forEach(function (screen) {
      screen.classList.toggle("active", screen.id === targetId);
    });
    tabs.forEach(function (tab) {
      tab.classList.toggle("on", tab.getAttribute("data-target") === targetId);
    });
    window.scrollTo(0, 0);
  }

  /* Wire each tab button to switch screens when clicked. */
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      if (target) {
        showScreen(target);
      }
    });
  });

  /* Start on the Assistant screen. */
  showScreen("screen-chatbot");
})();
