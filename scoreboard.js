var tbody = document.getElementById('scoreboard');

socket.on('score', function(data) {
  tbody.innerHTML = '';
  data.forEach(function(player) {
    var tr = document.createElement('tr');
    var name = document.createElement('td');
    name.textContent = player.name;
    var score = document.createElement('td');
    score.textContent = player.score;
    tr.appendChild(name);
    tr.appendChild(score);
    tbody.appendChild(tr);
  });
});