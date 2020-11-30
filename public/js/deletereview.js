function deleteReview(id){
    $.ajax({
        url: '/account/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
