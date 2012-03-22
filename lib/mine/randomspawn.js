ig.module(
    'mine.randomspawn'
)
    .requires(
    'impact.map'
)
    .defines(function(){

        ig.RandomSpawns = ig.Class.extend({
            data: [[]],
            spawnLocations: null,

            init: function(data) {
                this.data = data;
            },

            getSpawnLocation: function(data) {
                var spawnLayerName = '';
                var collisionLayerName = '';
                var spawnLayer = null;
                var collisionLayer = null;

                var spawnLayerTileIndexArray = data.layer.name[spawnLayerName].data
                var collisionLayerTileIndexArray = data.layer.name[collisionLayerName].data

                spawnLayerRows = spawnLayerTileIndexArray.length;
                spawnLayerColumns = spawnLayerTileIndexArray[0].length;

                collisionLayerRows = collisionLayerTileIndexArray.length;
                collisionLayerColumns = collisionLayerTileIndexArray[0].length;

            }
        });

    });