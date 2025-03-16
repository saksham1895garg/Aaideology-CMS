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
