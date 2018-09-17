// 获取选中区域的(x, y, w, h)
const getCropRect = (cropperMovableItems) => {
    let maxX = 0, maxY = 0
    for (let key in cropperMovableItems) {
        let item = cropperMovableItems[key]
        maxX = Math.max(item.x, maxX)
        maxY = Math.max(item.y, maxY)
    }

    let minX = maxX, minY = maxY
    for (let key in cropperMovableItems) {
        let item = cropperMovableItems[key]
        minX = Math.min(item.x, minX)
        minY = Math.min(item.y, minY)
    }

    return {
        x: minX,
        y: minY,
        w: maxX - minX,
        h: maxY - minY
    }
}

// 获取适应屏幕的图片显示大小
const getAdjustSize = (W, H, width, height) => {
    if (width > W) {
        height = W / width * height
        width = W
    }

    if (height > H) {
        width = H / height * width
        height = H
    }

    return {
        width: width,
        height: height
    }
}

// 获取适应最大长宽的大小
const getAdjustMaxSize = (width, height, max) => {
    if (width > max) {
        height = max / width * height
        width = max
    }

    if (height > max) {
        width = max / height * width
        height = max
    }

    return {
        width: width,
        height: height
    }
}

// http://www.geeksforgeeks.org/convex-hull-set-1-jarviss-algorithm-or-wrapping/

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are colinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function orientation(p, q, r) {
    var val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0;  // collinear
    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

// Prints convex hull of a set of n points.
function convexHull(points, n) {
    // There must be at least 3 points
    if (n < 3) return;

    // Initialize Result
    var hull = [];

    // Find the leftmost point
    var l = 0;
    for (var i = 1; i < n; i++) {
        if (points[i].x < points[l].x) {
            l = i;
        }
    }
    // Start from leftmost point, keep moving 
    // counterclockwise until reach the start point
    // again. This loop runs O(h) times where h is
    // number of points in result or output.
    var p = l, q;
    do {
        // Add current point to result
        // Prevent duplicates object
        // if (hull.findIndex(i => i.x == points[p].x && i.y == points[p].y)==-1){
        hull.push(points[p]);
        // }

        // Search for a point 'q' such that 
        // orientation(p, x, q) is counterclockwise 
        // for all points 'x'. The idea is to keep 
        // track of last visited most counterclock-
        // wise point in q. If any point 'i' is more 
        // counterclock-wise than q, then update q.
        q = (p + 1) % n;

        for (var i = 0; i < n; i++) {
            // If i is more counterclockwise than 
            // current q, then update q
            if (orientation(points[p], points[i], points[q]) == 2)
                q = i;
        }

        // Now q is the most counterclockwise with
        // respect to p. Set p as q for next iteration, 
        // so that q is added to result 'hull'
        p = q;

    } while (p != l);  // While we don't come to first 
    // point

    // Print Result
    // for (var i in hull) {
    //     var temp = hull[i]
    //     console.log("(" + temp.x + ", " + temp.y + ")");
    // }
    return hull
}

function drawImageWithDegree(ctx, path, width, height, degree) {
    let isVertical = degree % 180 > 0

    let drawWidth = isVertical ? height : width
    let drawHeight = isVertical ? width : height

    let centerX = width / 2
    let cneterY = height / 2

    let drawCenterX = drawWidth / 2
    let drawCneterY = drawHeight / 2

    let d = Math.abs(width - height) / 2

    // ctx.translate(drawCenterX, drawCneterY)
    // ctx.rotate(degree * Math.PI / 180)
    // ctx.translate(-drawCenterX, -drawCneterY)

    ctx.translate(centerX, cneterY)
    ctx.rotate(degree * Math.PI / 180)
    ctx.translate(-centerX, -cneterY)

    // ctx.translate(-d, d)
    if (isVertical) {
        if (drawHeight > drawWidth) {
            ctx.drawImage(path, d, -d, drawWidth, drawHeight)
        }
        else {
            ctx.drawImage(path, -d, d, drawWidth, drawHeight)
        }
    }
    else {
        ctx.drawImage(path, 0, 0, drawWidth, drawHeight)
    }

    ctx.draw(false, function (e) {
        console.log('draw callback')
    })
}

// 查找topleft的点
function findTopLeft(items) {
    let x = items.topleft.x, y = items.topleft.y
    for (let i in items) {
        let item = items[i]
        if (x > item.x) {
            x = item.x
        }
        if (y > item.y) {
            y = item.y
        }
    }
    return {
        x, y
    }
}

module.exports = {
    getCropRect,
    getAdjustSize,
    getAdjustMaxSize,
    convexHull,
    drawImageWithDegree,
    findTopLeft
}