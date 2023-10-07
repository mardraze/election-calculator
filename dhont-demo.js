const { createApp, ref } = Vue

createApp({
  setup() {
    
    var partyCounter = 1;
    var results = ref([]);
    var parties = ref([
        {
            id: partyCounter++,
            name: '',
            percent: 0,
            seats: 0
        }
    ]);
    var turns = ref(0);
    var currentTurn = ref(0);
    var loaded = ref(false);

    function getTurnResult(currentResults) {
        var partyPrevResult = {};
        var i, j, k, partyResult;
        for(var i=0; i<parties.value.length; i++){
            partyResult = 0;
            for(j=0;j<currentResults.length; j++){
                for(k=0;k<currentResults[j].length; k++){
                    if(currentResults[j][k].id === parties.value[i].id) {
                        partyResult += currentResults[j][k].seats;
                    }
                }
            }
            partyPrevResult[parties.value[i].id] = partyResult;
        }
        var turnResult = {};
        var partiesList = [];
        for(var i=0; i<parties.value.length; i++){
            let element = parties.value[i];
            let id = element.id;
            let percent = element.percent;
            let name = element.name;
            let prev = partyPrevResult[id] || 0;
            turnResult[id] = percent / (1 + prev);
            partiesList.push({
                id: id,
                name: name,
                percent: percent,
                prev: prev
            });
            console.log('id', id, parties.value);
            
        };
        for(i=0; i<parties.value.length; i++){
        }

        partiesList = partiesList.sort(function(a, b){
            return turnResult[b.id] - turnResult[a.id];
        });
        var winner = partiesList[0].id;
        let newResult = [];
        for(i=0; i<partiesList.length; i++){
            let r = {
                id: partiesList[i].id,
                name: partiesList[i].name
            };
            if(partiesList[i].id === winner) {
                r.seats = 1;
            }else{
                r.seats = 0;
            }
            r.result = turnResult[partiesList[i].id] || 0.0;
            r.resultRound = (r.result.toFixed(2) + '').replace('.00', '');
            r.calculations = partiesList[i].percent + ' / ' + (1 + partiesList[i].prev) + ' = ';
            newResult.push(r);
        }

        return newResult;
    }

    function updateResults() {
        var newResults = [];

        if(parties.value.length > 0) {
            for(var turn=0; turn<turns.value; turn++) {
                let n = [];
                for(var i=0; i<newResults.length; i++) {
                    n.push(newResults[i])
                }
                let t = getTurnResult(n);
                newResults.push(t);
            }
        }
        
        for(var i=0; i<parties.value.length; i++){
            let seats = 0;
            for(var j=0; j<newResults.length; j++){
                for(var k=0; k<newResults[j].length; k++){
                    if(newResults[j][k].id === parties.value[i].id) {
                        seats += newResults[j][k].seats;
                    }
                }
            }
            parties.value[i].seats = seats;
        }
        window.location.hash = JSON.stringify({
            parties: parties.value,
            turns: turns.value, 
            currentTurn: currentTurn.value
        })
        results.value = newResults;
    }
    function addParty() {
        var newParty = {
            id: partyCounter++,
            name: '',
            percent: 0
        };
        parties.value.push(newParty);
    }

    function removeParty(party){
        for(var i=0; i<parties.value.length; i++) {
            if(party.id === parties.value[i].id) {
                parties.value.splice(i, 1);
            }
        }
        updateResults();
    }

    if(window.location.hash){
        try{
            var hash = decodeURI(window.location.hash.substring(1));
            var hashValue = JSON.parse(hash);
            parties.value = hashValue.parties;
            turns.value = hashValue.turns;
            updateResults();
        }catch(e){
            console.log('Error', e)
        }
    }

    loaded.value = true;

    document.getElementById('root').classList.remove('hide');
    return {
      results,
      parties,
      currentTurn,
      turns,
      loaded,
      updateResults,
      addParty,
      removeParty
    }
  },
  
}).mount('#root')