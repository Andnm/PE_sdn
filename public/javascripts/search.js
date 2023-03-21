let search = $("#searchResults");

function showResults(str) {
  console.log(str);
  if (str.length === 0) {
    search.addClass("hide");
  } else {
    search.removeClass("hide");
    search.addClass("dp-block");
  }

  $.ajax({
    url: "/players",
    contentType: "application/json",
    method: "GET",
    data: { search: str },
    success: function (result) {
      search.html(result.response);
    },
  });
}

function onblurFunction() {
  search.addClass("hide");
}
