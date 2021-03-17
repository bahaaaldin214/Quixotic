export default class CollisionHandler {
    constructor(world) {
        this.world = world;
    }
    checkCollide(object) {
        const {
            world,
            colliding
        } = this;
        if (!world.objectsCollisionInfo[object.name]) {
            return;
        }
        const info = world.objectsCollisionInfo[object.name];

        const allObjectsObject = world.objects;
        const allObjects = Object.keys(info).map(key => {
            if (typeof allObjectsObject[key] == "undefined") {
                console.warn("Trying to get collision info of an undefined (" + key + ") object.");
            }
            return allObjectsObject[key];
        });
        for (let i = allObjects.length; i--;) {
            const currentObjectsList = allObjects[i];
            if (!currentObjectsList) {
                continue;
            }
            if (!Array.isArray(currentObjectsList)) {
                if(info[currentObjectsList.name]?.range){
                  this.inRange(object, currentObjectsList, info[currentObjectsList.name]);
                  continue;
                }
                this.checkCollideObjects(object, currentObjectsList, info[currentObjectsList.name]);
                continue;
            }
            for (let j = currentObjectsList.length; j--;) {
                const currentObject = currentObjectsList[j];
                const name = currentObject.name;
                if (currentObject.delete) {
                    allObjectsObject[name].splice(j, 1);
                    continue;
                }
                if (currentObject == object) {
                    continue;
                }
                if(info[name].range){
                  this.inRange(object, currentObject, info[name]);
                  continue;
                }
                this.checkCollideObjects(object, currentObject, info[name]);
            }
        }
    }
    checkCollideObjects(object1, object2, info) {
        const angle = this.colliding(object1, object2);
        if (object1.checkedCollide.has(object2) || object2.checkedCollide.has(object1)) {
            return;
        }
        object1.checkedCollide.set(object2, true);
        if (angle) {
            if (info.call && !info.range) {
                object1[info.call](object2);
            }
            if (info.elastic) {
                const velocity = object1.velocity;
                const [vx1, vy1] = object1.velocity;
                const _velocity = object2.velocity;
                const [vx2, vy2] = _velocity;
                const PI = Math.PI;
                if ((angle >= 0 && angle < PI / 4) || (angle > 7 / 4 * PI && angle < PI * 2)) {
                  if (vx1 > 0) {
                        velocity[0] = 0;
                    }
                    if (vx2 < 0) {
                        _velocity[0] = 0;
                    }
                } else if (angle >= PI / 4 && angle < 3 / 4 * PI) {
                    if (vy1 > 0) {
                        velocity[1] = 0;
                    }
                    if (vy2 < 0) {
                        _velocity[1] = 0;
                    }
                } else if (angle >= 3 / 4 * PI && angle < 5 / 4 * PI) {
                    if (vx1 < 0) {
                        velocity[0] = 0;
                    }
                    if (vx2 > 0) {
                        _velocity[0] = 0;
                    }
                } else {
                    if (vy1 < 0) {
                        velocity[1] = 0;
                    }
                    if (vy2 > 0) {
                        _velocity[1] = 0;
                    }
                }
            }
        }
    }
    colliding(o1, o2) {
        const [x1, y1] = o1.coords;
        const [w1, h1] = o1.area;
        const halfWidth1 = w1 / 2;
        const halfHeight1 = h1 / 2;
        const left1 = x1 - halfWidth1;
        const right1 = x1 + halfWidth1;
        const top1 = y1 - halfHeight1;
        const bottom1 = y1 + halfHeight1;
        const [x2, y2] = o2.coords;
        const [w2, h2] = o2.area;
        const halfWidth2 = w2 / 2;
        const halfHeight2 = h2 / 2;
        const left2 = x2 - halfWidth2;
        const right2 = x2 + halfWidth2;
        const top2 = y2 - halfHeight2;
        const bottom2 = y2 + halfHeight2;
        if (left1 <= right2 && right1 >= left2 && top1 <= bottom2 && bottom1 >= top2) {
            let dx = x2 - x1;
            let dy = y2 - y1;
            let angle = Math.atan2(dy, dx);
            if (angle < 0) {
                angle += Math.PI * 2;
            }
            return angle;
        }
    }

    inRange(o, o1, info) {
      const {range, call, elastic} = info;
      const [x, y] = o.coords,
      [rx, ry] = o1.coords,
      [rw, rh] = o1.area;

      let testX = x,
      testY = y;

      if (x < rx-rw/2)         testX = rx-rw/2;
      else if (x > rx+rw/2) testX = rx+rw/2;
      if (y < ry-rh/2)         testY = ry-rh/2;
      else if (y > ry+rh/2) testY = ry+rh/2;

      const distX = x-testX;
      const distY = y-testY;
      const distance = Math.sqrt( (distX*distX) + (distY*distY) );
      if (distance <= range) {
        if(call){
          o[call](o1);
        }
      }
      if(elastic){
        this.checkCollideObjects(o1, o, info);
      }
    }
}
