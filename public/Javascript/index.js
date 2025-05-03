
console.log("Starting")





document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".side").style.transform = "translateX(0)";
})
document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".side").style.transform = "translateX(-300px)";
})

const stars = document.querySelectorAll(".stars input");
stars.forEach(star => {
    star.addEventListener("change", () => {
        const rating = star.id.replace('star', '');
        if (rating == '1'){
            document.querySelector('.very-bad').style.display = 'block';
            document.querySelector('.bad').style.display = 'none';
            document.querySelector('.good').style.display = 'none';
            document.querySelector('.very-good').style.display = 'none';
            document.querySelector('.excellent').style.display = 'none';
        }
        else if (rating == '2') {
            document.querySelector('.very-bad').style.display = 'none';
            document.querySelector('.bad').style.display = 'block';
            document.querySelector('.good').style.display = 'none';
            document.querySelector('.very-good').style.display = 'none';
            document.querySelector('.excellent').style.display = 'none';
        }
        else if (rating == '3') {
            document.querySelector('.very-bad').style.display = 'none';
            document.querySelector('.bad').style.display = 'none';
            document.querySelector('.good').style.display = 'block';
            document.querySelector('.very-good').style.display = 'none';
            document.querySelector('.excellent').style.display = 'none';
        }
        else if (rating == '4') {
            document.querySelector('.very-bad').style.display = 'none';
            document.querySelector('.bad').style.display = 'none';
            document.querySelector('.good').style.display = 'none';
            document.querySelector('.very-good').style.display = 'block';
            document.querySelector('.excellent').style.display = 'none';
        }
        else {
            document.querySelector('.very-bad').style.display = 'none';
            document.querySelector('.bad').style.display = 'none';
            document.querySelector('.good').style.display = 'none';
            document.querySelector('.very-good').style.display = 'none';
            document.querySelector('.excellent').style.display = 'block';
        }
    });
});


/*
const texts = ["A Perfect Source!", "You are already hired..."]; // Sentences to display
const textContainer = document.querySelector(".discription"); // Use class name

let currentIndex = 0;

function displayCharacterByCharacter(text, callback) {
    textContainer.innerHTML = ""; // Clear the container
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            textContainer.innerHTML += text[index]; // Add next character
            index++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                textContainer.classList.add("hidden"); // Hide text
                setTimeout(() => {
                    textContainer.classList.remove("hidden"); // Show new text
                    callback();
                }, 1000);
            }, 1000); // Wait before hiding
        }
    }, 200); // Speed of character appearing
}

function startAnimation() {
    displayCharacterByCharacter(texts[currentIndex], () => {
        currentIndex = (currentIndex + 1) % texts.length; // Loop back to first text
        startAnimation();
    });
}

startAnimation();
*/





// Handle form submission
document.querySelector('.post-rev').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedRating = document.querySelector('input[name="star"]:checked');
    if (!selectedRating) {
        alert('Please select a rating');
        return;
    }

    const reviewData = {
        rating: selectedRating.id.replace('star', ''),
        name: document.querySelector('#name-rew').value,
        comment: document.querySelector('#comment').value
    };

    if (!reviewData.name || !reviewData.comment) {
        alert('Please fill in all fields');
        return;
    }

    fetch("/user/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // Reset form and clear rating selection
            this.reset();
            document.querySelectorAll('.stars input').forEach(input => input.checked = false);
            // Hide all rating condition messages
            document.querySelectorAll('.rating-conditions h5').forEach(h5 => h5.style.display = 'none');
        } else {
            alert(data.message || 'Failed to submit review');
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});

// Handle three-dot menu for all review cards
document.addEventListener('click', function(e) {
    // Check if clicked element is a three-dot menu
    if (e.target.classList.contains('three')) {
        const edidel = e.target.closest('.review-cards').querySelector('.rev-edit-del');
        edidel.style.display = edidel.style.display === 'block' ? 'none' : 'block';
    } else {
        // Close all rev-edit-del menus when clicking outside
        document.querySelectorAll('.rev-edit-del').forEach(edidel => {
            edidel.style.display = 'none';
        });
    }
});

// Added code for fast counting animation on .trust-number

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.bottom >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

function fastCount(element, start, end, duration) {
    let current = start;
    const range = end - start;
    const stepTime = Math.max(Math.floor(duration / range), 10);
    const timer = setInterval(() => {
        current++;
        if (current > end) {
            clearInterval(timer);
            element.textContent = end >= 1000 ? (end / 1000).toFixed(1) + 'k' : end;
            console.log("Counting finished:", element.textContent);
        } else {
            element.textContent = current >= 1000 ? (current / 1000).toFixed(1) + 'k' : current;
            console.log("Counting:", element.textContent);
        }
    }, stepTime);
}

document.addEventListener('DOMContentLoaded', () => {
    const trustNumber = document.querySelector('.trust-number');
    let counted = false;

    function onScroll() {
        if (!counted && isInViewport(trustNumber)) {
            console.log("Element in viewport, starting count");
            fastCount(trustNumber, 800, 1300, 1000);
            counted = true;
            window.removeEventListener('scroll', onScroll);
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll();
});
