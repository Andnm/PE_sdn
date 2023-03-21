let filterTable = $("#tableItem");
let checkbox = $(
  Array.from(document.querySelectorAll("input[type='checkbox']"))
);
var selections = {};
const filterResult = [];

checkbox.on("click", filter);

function filter(e) {
  if (e.target.checked) {
    selections[e.target.id] = {
      name: e.target.name,
      value: e.target.value,
    };
  } else {
    selections[e.target.id] = {
      name: e.target.name,
      value: e.target.value,
    };
    for (let unselec of filterResult) {
      if (unselec.value == selections[e.target.id].value) {
        filterResult.splice(filterResult.indexOf(unselec), 1);
      }
    }
    delete selections[e.target.id];
  }

  for (var key in selections) {
    var listItem = { name: selections[key].name, value: selections[key].value };
    filterResult.push(listItem);
    selections = {};
  }

  console.log(filterResult);

  $.ajax({
    url: "/players",
    contentType: "application/json",
    method: "POST",
    data: JSON.stringify({ filterArray: filterResult }),
    success: (players) => {
      // Render the players to the UI
      renderPlayers(players);
    },
    error: (err) => {
      console.log(err);
    },
  });
}

async function renderPlayers(result) {
  // Clear the players list
  filterTable.empty();

  let listItemHeader = `<table class="table">
      <thead>
        <tr>
          <th scope="col">Image</th>
          <th scope="col">Name</th>
          <th scope="col">Nation</th>
          <th scope="col">Club</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>`;

  let listItemBody = [];

  // Loop through the players and add them to the list
  result.players.forEach((player) => {
    let listItem = `
          <tr>
            <td><img class="rounded" src='${player.image}' /></td>
            <td>${player.name}</td>
            <td>
                <img src="${player.nation.image}" alt="" class="player-nation" />
            </td>
            <td>${player.club}</td>
            <td>
              <div class="buttons">
                <div class="dropdown">
                  <button class="btn btn-success" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots" viewBox="0 0 16 16">
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                    </svg>
                  </button>
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="btn detail-btn" href="/players/details/${player._id}">Details</a></li>
                  </ul>
                </div>
              </div>
            </td>
          </tr>
  `;
    listItemBody.push(listItem);
  });
  let listItemFooter = ` </tbody>
    </table>`;

  await filterTable.html(
    listItemHeader + listItemBody.join("") + listItemFooter
  );
}
