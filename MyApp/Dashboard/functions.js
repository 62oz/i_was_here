import { calculateDistance } from "./location";

export const formatPostsDate = (posts, location) => {
    posts.forEach((post) => {
        let distance = calculateDistance(location.latitude, location.longitude, post.latitude, post.longitude);
        // if distance is less than 1km, show xx m, else show xx km without decimals
        if (distance < 1) {
            post.distance = Math.floor(distance * 1000) + ' m';
        } else {
            post.distance = Math.floor(distance) + ' km';
        }
        // if post was created less than 1 hour ago, show xx minutes ago, if less than 1 day ago, show xx hours ago, if less than 21 days ago show xx days ago, else in dd/mm/yyyy
        const postDate = new Date(post.created_at);
        const now = new Date();
        const diff = now - postDate;
        if (diff < 3600000) {
          post.date = Math.floor(diff / 60000) + ' m';
        } else if (diff < 86400000) {
          post.date = Math.floor(diff / 3600000) + ' h';
        } else if (diff < 1814400000) {
          post.date = Math.floor(diff / 86400000) + ' d';
        } else {
          post.date = postDate.getDate() + '/' + (postDate.getMonth() + 1) + '/' + postDate.getFullYear();
        }
      });
        return posts;
    };

    function isColliding(position1, position2, radius) {
        const dx = position1.left - position2.left;
        const dy = position1.top - position2.top;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < radius * 2;
        }

 // Calculate circle positions
 export const generateCirclePosition = (avoidPositions, circleSizes) => {
    let maxTries = 1000;
    let validPosition = false;
    let circlePosition;

    if (avoidPositions.length === 0) {
      return {
          top: 0,
          left: 0
      };
  }

    while (maxTries > 0 && !validPosition) {
        circlePosition = {
            top: Math.random() * 2000 - 1000,
            left: Math.random() * 2000 - 1000,
        };
        validPosition = true;

        for (let avoidPos of avoidPositions) {
            if (isColliding(circlePosition, avoidPos, circleSizes[circleSizes.length - 1])) {
                validPosition = false;
                break;
            }
        }
        maxTries--;
    }
    return circlePosition;
};

// Calculate circle sizes
export const generatePostsSizes = (sortedPosts) => {
    const maxLikes = Math.max(...sortedPosts.map((post) => post.likes));
    const circleSizes = sortedPosts.map((post) => {
        const size = 30 + (post.likes / maxLikes) * 50;
        return !isNaN(size) && size > 0 ? size : 100; // Fallback size of 100 if the calculated size is invalid
    });
    return circleSizes;
};

// Calculate circle positions
export const generatePostsPositions = (sortedPosts, circleSizes) => {
    const circlePositions = sortedPosts.map((_, index, arr) => {
        const position = generateCirclePosition(arr.slice(0, index), circleSizes);
        return {
            top: !isNaN(position.top) ? position.top : 0,  // Fallback to 0 if invalid
            left: !isNaN(position.left) ? position.left : 0 // Fallback to 0 if invalid
        };
    });
    return circlePositions;
};
