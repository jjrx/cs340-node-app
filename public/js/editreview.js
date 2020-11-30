function editReview(id){
    $.ajax({
        url: '/editreview/' + id,
        type: 'PUT',
        data: $('#edit-review').serialize(),
        success: function(result){
            // window.location.replace("./");
            // window.location.reload(true);
            window.location.href="/account";
        }
    })
};
