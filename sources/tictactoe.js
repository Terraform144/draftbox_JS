var stage, statusTxt, player, over;
var board = [[0,0,0],[0,0,0],[0,0,0]];
var wins = [
  [[0,0],[0,1],[0,2]],[[1,0],[1,1],[1,2]],[[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0]],[[0,1],[1,1],[2,1]],[[0,2],[1,2],[2,2]],
  [[0,0],[1,1],[2,2]],[[0,2],[1,1],[2,0]]
];

function mkMarker(r, c, type) {
  var x = c * 110 + 65, y = r * 110 + 110;
  var mc = new createjs.MovieClip({ mode: createjs.MovieClip.INDEPENDENT, framerate: 30, loop: 0 });
  var s = new createjs.Shape();
  var g = s.graphics;
  s.x = 0; s.y = 0;
  if (type === 'X') {
    g.setStrokeStyle(5).beginStroke('#e94560');
    g.moveTo(-25, -25).lineTo(25, 25);
    g.moveTo(25, -25).lineTo(-25, 25);
  } else {
    g.setStrokeStyle(5).beginStroke('#0f3460');
    g.drawCircle(0, 0, 28);
  }
  s.scaleX = 0; s.scaleY = 0; s.regX = 0; s.regY = 0;
  mc.addChild(s);
  mc.x = x; mc.y = y;
  mc.timeline.addTween(createjs.Tween.get(s).to({ scaleX: 1, scaleY: 1 }, 12));
  stage.addChild(mc);
  mc.gotoAndPlay(0);
  return mc;
}

function hit(r, c) {
  if (over || board[r][c] !== 0) return;
  board[r][c] = player;
  mkMarker(r, c, player === 1 ? 'X' : 'O');
  var w = chk();
  if (w) {
    over = true;
    statusTxt.text = (player === 1 ? 'X' : 'O') + ' wins!';
    drawLine(w);
    addBtn();
  } else if (board.flat().every(function(v) { return v !== 0; })) {
    over = true;
    statusTxt.text = 'Draw!';
    addBtn();
  } else {
    player = player === 1 ? 2 : 1;
    statusTxt.text = (player === 1 ? 'X' : 'O') + '\'s turn';
  }
}

function chk() {
  for (var i = 0; i < wins.length; i++) {
    var w = wins[i];
    var v = board[w[0][0]][w[0][1]];
    if (v !== 0 && board[w[1][0]][w[1][1]] === v && board[w[2][0]][w[2][1]] === v) return w;
  }
  return null;
}

function drawLine(win) {
  var x1 = win[0][1] * 110 + 65, y1 = win[0][0] * 110 + 110;
  var x2 = win[2][1] * 110 + 65, y2 = win[2][0] * 110 + 110;
  var l = new createjs.Shape();
  l.graphics.setStrokeStyle(4).beginStroke('#00ff88');
  l.graphics.moveTo(x1, y1).lineTo(x2, y2);
  l.alpha = 0;
  stage.addChild(l);
  createjs.Tween.get(l).to({ alpha: 1 }, 400);
}

function addBtn() {
  var bg = new createjs.Shape();
  bg.graphics.beginFill('#e94560').drawRoundRect(275, 340, 150, 40, 8);
  bg.alpha = 0;
  stage.addChild(bg);
  var t = new createjs.Text('Play Again', '18px monospace', '#fff');
  t.textAlign = 'center'; t.textBaseline = 'middle';
  t.x = 350; t.y = 360; t.alpha = 0;
  stage.addChild(t);
  createjs.Tween.get(bg).to({ alpha: 1 }, 300);
  createjs.Tween.get(t).to({ alpha: 1 }, 300);
  bg.addEventListener('click', restart);
  t.addEventListener('click', restart);
  stage.update();
}

function restart() {
  stage.removeAllChildren();
  board = [[0,0,0],[0,0,0],[0,0,0]];
  player = 1; over = false;
  drawBoard();
}

function drawBoard() {
  var bg = new createjs.Shape();
  bg.graphics.beginFill('#1a1a2e').drawRect(0, 0, canvas.width, canvas.height);
  stage.addChild(bg);
  var title = new createjs.Text('Tic Tac Toe', '28px monospace', '#e94560');
  title.textAlign = 'center'; title.x = 350; title.y = 20;
  stage.addChild(title);
  statusTxt = new createjs.Text('X\'s turn', '16px monospace', '#ccc');
  statusTxt.textAlign = 'center'; statusTxt.x = 350; statusTxt.y = 350;
  stage.addChild(statusTxt);
  for (var r = 0; r < 3; r++) {
    for (var c = 0; c < 3; c++) {
      var x = c * 110 + 15, y = r * 110 + 60;
      var cell = new createjs.Shape();
      cell.graphics.beginFill('#16213e').drawRect(0, 0, 100, 100);
      cell.graphics.setStrokeStyle(2).beginStroke('#0f3460').drawRect(0, 0, 100, 100);
      cell.x = x; cell.y = y;
      stage.addChild(cell);
      cell.addEventListener('click', (function(rr, cc) {
        return function() { hit(rr, cc); };
      })(r, c));
    }
  }
  stage.update();
}

function init() {
  player = 1; over = false;
  stage = new createjs.Stage(canvas);
  if (createjs.Touch && createjs.Touch.isSupported()) {
    createjs.Touch.enable(stage, true);
  }
  drawBoard();
}

function update(dt) {
  var ms = dt * 1000;
  var mcList = stage.children.filter(function(c) { return c instanceof createjs.MovieClip && !c.paused; });
  for (var i = 0; i < mcList.length; i++) {
    mcList[i]._tick({ delta: ms });
  }
  createjs.Tween.tick(ms, false);
}

function draw(ctx) {
  stage.update();
}
