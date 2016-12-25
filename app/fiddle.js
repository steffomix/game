

// causes the error
function AnyClass() {
    PIXI.Sprite.call(this, PIXI.Sprite.fromImage('whatever-image'));
}
AnyClass.prototype = Object.create(PIXI.Sprite.prototype);

// works
function AnyClass() {
    PIXI.Sprite.call(this, PIXI.Texture.fromImage('whatever-image'));
}
AnyClass.prototype = Object.create(PIXI.Sprite.prototype);

// PIXI.Sprite.call(this, PIXI.Sprite.fromImage(...
// must be
// PIXI.Sprite.call(this, PIXI.Texture.fromImage(...


