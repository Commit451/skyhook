// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');
  
  var currentLink = window.location.href
  console.log(currentLink);
  var link = getParameterByName("link", currentLink)
  console.log("Passed link: " + link);
  if (link != null) {
    $("#bytes").val(link);
  }
  $( "#follow" ).click(function() {
      goToLink();
  });
  $("#bytes").keyup(function(event){
    if(event.keyCode == 13){
      goToLink();
    }
  });
  function goToLink() {
    var link = $("#bytes").val();
    var win = window.open(link, "_blank");
  }
  function getParameterByName(name, url) {
      if (!url) {
        url = window.location.href;
      }
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

});
