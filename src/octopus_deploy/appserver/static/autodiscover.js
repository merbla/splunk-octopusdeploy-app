require.config({
    paths: {
        "app": "../app"
    }
});

require(['splunkjs/mvc/simplexml/ready!'], function(){
    require(['splunkjs/ready!'], function(){
        // The splunkjs/ready loader script will automatically instantiate all elements
        // declared in the dashboard's HTML.


        // Refetch page every 5 minutes automatically
        window.setInterval(function() {
            window.location.reload();
        }, 5*60*1000);
    });
});
