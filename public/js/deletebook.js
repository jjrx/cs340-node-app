function deleteBook(id){
    $.ajax({
        url: '/books/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
