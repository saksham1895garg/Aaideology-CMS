document.querySelector('.apply-btn').addEventListener('click', function() {
    const applyContainer = document.querySelector('.big-apply-container');
    const detailsSection = document.querySelector('.details');
    
    if (applyContainer.style.display === 'block') {
        applyContainer.style.display = 'none';
        detailsSection.style.filter = 'none';
    } else {
        applyContainer.style.display = 'block';
        detailsSection.style.filter = 'blur(5px)';
    }
});

document.querySelector('.cross-img-cv').addEventListener('click', function() {
    const applyContainer = document.querySelector('.big-apply-container');
    const detailsSection = document.querySelector('.details');
    
    applyContainer.style.display = 'none';
    detailsSection.style.filter = 'none';
});
