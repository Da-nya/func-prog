const block_size = 80;
const explosion_frames = 1;

const tankUp = new Image();
tankUp.src = "img/up_tank.png";
const tankDown = new Image();
tankDown.src = "img/down_tank.png";
const tankLeft = new Image();
tankLeft.src = "img/left_tank.png";
const tankRight = new Image();
tankRight.src = "img/right_tank.png";

const tank2Up = new Image();
tank2Up.src = "img/up_tank2.png";
const tank2Down = new Image();
tank2Down.src = "img/down_tank2.png";
const tank2Left = new Image();
tank2Left.src = "img/left_tank2.png";
const tank2Right = new Image();
tank2Right.src = "img/right_tank2.png";

const wall1 = new Image();
wall1.src = "img/wall.png";
const grass = new Image();
grass.src = "img/grass.png"
const water = new Image();
water.src = "img/water.png";
const expl1 = new Image();
expl1.src = "img/explosion0.png";
const expl2 = new Image();
expl2.src = "img/explosion1.png";
const expl3 = new Image();
expl3.src = "img/explosion2.png";
var images = [
	tankUp, tankDown, tankLeft, tankRight, 
	tank2Up, tank2Down, tank2Left, tank2Right,
	wall1, grass, water, expl1, expl2, expl3,
];


class Tank{
	#id;
	#x;
	#y;
	#keys;
	#rotation;
	#images;
	constructor(props){
        this.#x = props.x;
        this.#y = props.y;
		this.#images = props.images;
        this.#id = props.id;     
        this.#rotation = props.rotate;
        this.#keys = props.keys;
    }
	move(keyPressed){
        let count = 0;
		if (keyPressed[this.#keys.shoot])
			return 'shoot';

        if (keyPressed[this.#keys.up])
            count++;
        if (keyPressed[this.#keys.down])
            count++;
        if (keyPressed[this.#keys.left])
            count++;
        if (keyPressed[this.#keys.right])
            count++;
        
        if (count != 1)
			return false;

		if (keyPressed[this.#keys.up])
			return 'up';
        if (keyPressed[this.#keys.down])
			return 'down';
        if (keyPressed[this.#keys.left])
			return 'left';
        if (keyPressed[this.#keys.right])
			return 'right';
	}
	setPosition(pos){
		if(pos.x || pos.x === 0){
			this.#x = pos.x;
		}
		if (pos.y || pos.y === 0){
			this.#y = pos.y;
		}
	}
	getPosition(){
		return {x: this.#x, y: this.#y}
	}
	setRotate(rotate){
		this.#rotation = rotate;
	}
	getRotate(){
		return this.#rotation;
	}
	getImage(){
		return this.#images[this.#rotation];
	}
	getId(){
		return this.#id;
	}
}

class Game{
	constructor(props){
		this.canvas = props.canvas;
		this.keyPressed = new Array(256);
		let keys = this.keyPressed;

		document.addEventListener('keydown', function (event){
			keys[event.keyCode] = true;
			event.preventDefault();
		});
		document.addEventListener('keyup', function (event){
			keys[event.keyCode] = false;
			event.preventDefault();
		})
			
		this.playerList = [];
		this.game_map = props.game_map;
		this.bullet_map = this.game_map.map(function (x){
			return new Array(x.length).fill(0);
		});

		let tank_pos = this.getEmptyPos(this.game_map, this.bullet_map);
		this.game_map[tank_pos.y][tank_pos.x] = 1;
		let player = new Tank({
			x: tank_pos.x,
			y: tank_pos.y,
			id: 1,
			keys: {
				left: 37,
				up: 38,
				right: 39,
				down: 40,
				shoot: 13
			},
			rotate: 'up',
			images: {left: tankLeft, up: tankUp, right: tankRight, down: tankDown}
		 })
		this.playerList.push(player);
		
		tank_pos = this.getEmptyPos(this.game_map, this.bullet_map);
		this.game_map[tank_pos.y][tank_pos.x] = 2;
		player = new Tank({
			x: tank_pos.x,
			y: tank_pos.y,
			id: 2,
			keys: {
				left: 65,
				up: 87,
				right: 68,
				down: 83,
				shoot: 32
			},
			rotate: 'up',
			images: {left: tank2Left, up: tank2Up, right: tank2Right, down: tank2Down}
		 })
		this.playerList.push(player);

		//контроль игры
		setInterval(() => {
			drawLevel(this.canvas, this.game_map, this.bullet_map, this.playerList);
			let killed_tanks = [];
			[this.game_map, this.bullet_map, killed_tanks] = this.move_Bullet(this.game_map, this.bullet_map);
			for (let id of killed_tanks){
				let tank = this.getTankById(this.playerList, id)
				let pos = this.getEmptyPos(this.game_map, this.bullet_map);
				this.game_map[pos.y][pos.x] = id;
				tank.setPosition(pos);
			}

			[this.game_map, this.bullet_map] = this.move_tanks(this.keyPressed, this.playerList, this.game_map, this.bullet_map);
			this.game_map = this.control_explosions(this.game_map);
		}, 80);
	}

	move_tanks(keyPressed, playerList, game_map, bullet_map){
		for(let tank of playerList){
			let move = tank.move(keyPressed);
			let pos = tank.getPosition();			
			let rotate = tank.getRotate();

			let rotation = 'up';
			if (move == rotation) {
				if (rotate != rotation)
					tank.setRotate(rotation);
				else
					if (pos.y > 0)
						if (game_map[pos.y - 1][pos.x] === 0) {
							let code = game_map[pos.y][pos.x];
							game_map[pos.y][pos.x] = 0;
							game_map[pos.y - 1][pos.x] = code;
							tank.setPosition({x: pos.x, y: pos.y - 1});
					}
			}
			
			rotation = 'down';
			if (move == rotation) {
				if (rotate != rotation)
					tank.setRotate(rotation);
				else
					if (pos.y < game_map.length - 1)
						if (game_map[pos.y + 1][pos.x] === 0) {
							let code = game_map[pos.y][pos.x];
							game_map[pos.y][pos.x] = 0;
							game_map[pos.y + 1][pos.x] = code;
							tank.setPosition({x: pos.x, y: pos.y + 1});
					}
			}

			rotation = 'left';
			if (move == rotation) {
				if (rotate != rotation)
					tank.setRotate(rotation);
				else
					if (pos.x > 0)
						if (game_map[pos.y][pos.x - 1] === 0) {
							let code = game_map[pos.y][pos.x];
							game_map[pos.y][pos.x] = 0;
							game_map[pos.y][pos.x - 1] = code;
							tank.setPosition({x: pos.x - 1, y: pos.y});
					}
			}

			rotation = 'right';
			if (move == rotation) {
				if (rotate != rotation)
					tank.setRotate(rotation);
				else
					if (pos.x < game_map.length - 1)
						if (game_map[pos.y][pos.x + 1] === 0) {
							let code = game_map[pos.y][pos.x];
							game_map[pos.y][pos.x] = 0;
							game_map[pos.y][pos.x + 1] = code;
							tank.setPosition({x: pos.x + 1, y: pos.y});
					}
			}

			if (move == "shoot")
			{
				switch(rotate){
					case 'up': 
						if(pos.y > 0)
							bullet_map[pos.y - 1][pos.x] = 1;
					break;
					case 'down': 
						if(pos.y < game_map.length - 1)
							bullet_map[pos.y + 1][pos.x] = 3;
					break;
					case 'left': 
						if(pos.x > 0)
							bullet_map[pos.y][pos.x - 1] = 4;
					break;
					case 'right': 
						if(pos.x < game_map.length - 1)
							bullet_map[pos.y][pos.x + 1] = 2;
					break;
				}
			}
		}
		return [game_map, bullet_map];
	}
	control_explosions(game_map){
		for (var i = 0; i < game_map.length; i++)
			for (var j = 0; j < game_map.length; j++) 
				if (typeof game_map[i][j] == 'object'){
					switch (game_map[i][j].type){
						case -1: 
							game_map[i][j].frames -= 1;
							if (game_map[i][j].frames < 0)
								game_map[i][j] = {type: -2, frames: explosion_frames};
							break;
						case -2:
							game_map[i][j].frames -= 1;
							if (game_map[i][j].frames < 0)
								game_map[i][j] = {type: -3, frames: explosion_frames};
							break;
						case -3:
							game_map[i][j].frames -= 1;
							if (game_map[i][j].frames < 0)
								game_map[i][j] = 0;
							break;
					}
				}
		return game_map;
	}

	move_Bullet(game_map, bullet_map)
	{
		let bullet_map_next = bullet_map.map(function (x) {return new Array(x.length).fill(0) });
		let killed_tanks = [];
		for (var i = 0; i < game_map.length; i++)
			for (var j = 0; j < game_map.length; j++) 
				if (bullet_map[i][j] != 0)
				{
					let bul = bullet_map[i][j];
					let ii;
					let jj;
					switch (game_map[i][j]) {
						case 1: 
						case 2: 
							killed_tanks.push(game_map[i][j]);
							game_map[i][j] = {type: -1, frames: explosion_frames};
							break;
						case 3: bullet_map_next[i][j] = 0;
							break;
						case 4: game_map[i][j] = 0;
							break;
						default:
							if ((bul === 1) && (i > 0)) {
								ii = i - 1;
								jj = j;
							}
							if ((bul === 2) && (j < game_map.length - 1)) {
								ii = i;
								jj = j + 1;
							}
							if ((bul === 3) && (i < game_map.length - 1)) {
								ii = i + 1;
								jj = j;
							}
							if ((bul === 4) && (j > 0)) {
								ii = i;
								jj = j - 1;
							}
							if (ii === undefined)
								break;
							if ((bullet_map[ii][jj] === 1 && bullet_map[i][j] === 3) ||
								(bullet_map[ii][jj] === 2 && bullet_map[i][j] === 4) ||
								(bullet_map[ii][jj] === 3 && bullet_map[i][j] === 1) ||
								(bullet_map[ii][jj] === 4 && bullet_map[i][j] === 2))
								{
								bullet_map[ii][jj] = 0;
								game_map[ii][jj] = {type: -1, frames: 10};
								}// устроить ВЗРЫВ
							else
								if (bullet_map_next[ii][jj] != 0)
								{
									bullet_map_next[ii][jj] = 0;
									game_map[ii][jj] = {type: -1, frames: 10}; //EXPLOSIONS
								}
								else bullet_map_next[ii][jj] = bul;
							break;

					}
				}
		return [game_map, bullet_map_next, killed_tanks];
	}

	getEmptyPos(game_map, bullet_map)
	{
		var x = Math.floor(Math.random() * game_map.length);
		var y = Math.floor(Math.random() * game_map.length);
		while (game_map[x][y]!=0 || bullet_map[x][y]!=0)
		{
			x = Math.floor(Math.random() * game_map.length);
			y = Math.floor(Math.random() * game_map.length);
		}
		return {x:y, y:x}
	}

	getTankById(tanks, id){
		for (var tank of tanks)
			if (tank.getId() == id)
				return tank;
	}
}

// Загрузка изображений, после этого создается игра
Promise.all(images.map(img => {
    if (img.complete)
        return Promise.resolve(img.naturalHeight !== 0);
    return new Promise(resolve => {
        img.addEventListener('load', () => resolve(true));
        img.addEventListener('error', () => resolve(false));
    });
})).then(results => {
    if (results.every(res => res))
	{
		let game_map=[
			[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],
			[0,3,4,0,0,0,0,5,5,0],
			[4,3,0,4,0,0,0,0,0,0],
			[4,3,5,3,4,3,3,0,3,0],
			[4,0,0,0,0,4,0,0,3,0],
			[4,0,0,0,0,3,3,0,3,0],
			[0,0,0,0,0,0,3,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0],
		];
		new Game({game_map: game_map, canvas: document.getElementById("canvas")});
	}
    else
        alert('Ошибка загрузки изображений');
});

function drawLevel(canvas, game_map, bullet_map, tanks)
	{
		context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);

		for(let tank of tanks){
			let pos = tank.getPosition();
			let tank_img = tank.getImage();
			this.drawImage(context, tank_img, pos.x * block_size, pos.y * block_size);
		}
		for (var i = 0; i < game_map.length; i++){
			for (var j = 0; j < game_map.length; j++) {
				if (game_map[i][j] ===3)
				{
					this.drawImage(context, wall1, j * block_size, i * block_size);
				}
				if (game_map[i][j] === 4)
				{
					this.drawImage(context, grass, j * block_size, i * block_size)
				}
				if (game_map[i][j] === 5)
				{
					this.drawImage(context, water, j * block_size, i * block_size)
				}
				if (game_map[i][j] === 6)
				{
					this.drawImage(context, shield, j * block_size, i * block_size);
				}
				if (bullet_map[i][j] != 0)
					{
						var centerX = j*block_size + block_size /2;
						var centerY = i*block_size + block_size /2;
						context.fillStyle = "white";
						context.fillRect(centerX -5, centerY -5 , 10,10);
					}

				if (typeof game_map[i][j] == 'object'){
					switch (game_map[i][j].type){
						case -1: 
							this.drawImage(context, expl3, j * block_size, i * block_size);
							break;
						case -2:
							this.drawImage(context, expl2, j * block_size, i * block_size);
							break;
						case -3:
							this.drawImage(context, expl1, j * block_size, i * block_size);
							break;
					}
				}	
			}
		}
	}

function drawImage(context, source, x, y)
	{
		context.drawImage(source, x, y, block_size, block_size);
	};