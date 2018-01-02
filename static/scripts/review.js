var json_x = {
    "key": "eqvsi_94510af153a64129aec6a8b3780ff680_44c54f22fad5460dacf4a381d28c780e",
    "label": "\u10d4\u10e5\u10d5\u10e1\u10d8",
    "url": "https://00e9e64bac05166f5a8f9207b3d0e51660b6b0a0c62aa002e2-apidata.googleusercontent.com/download/storage/v1/b/ge-open-speech-recording.appspot.com/o/ogg%2FCarTe_007c0916470243ad927949e6f1eef8e5_c1c90a20f408487f9f6ae435b832f72a.ogg?qk=AD5uMEuKkSD8lWwGAF5ZhkpPjHANedDqIXq9Iprtv89T9Tk-GeLwSjALhhptDHFUAmAMCfwKeHlsEB2NVExKxhsF6uc1IECfR7Asc0PAcDbalQ5Ti8Cke3_zwZuDMJyvp6yN25ynQC7cUQd6qKZc5NqUXGrRxE7PDeTii1oc1nZ7AKB5WISLQqjCxxeCC62dDG6autU629iM5TfDDMn12JpvkLbaDybzZ18-ZPIyqN2RkJbTSGxF_7JV6VV5kPlvcqakBJq6EEMfvs-MdrR_AqtipVCVu7_uLrofgIlHcTiDMdP-Mv4p9havN5YB9g8e3wVP43Mx-Z8qt9Rh3sTu87wTFeWdUGl3ImKmcdGevVLnBDgcV6dfKsgCjlmUuQvpcMz7VXC1TN0Ai3eks694kzea6iTdZNNXtmAjK9_wwQ--k0igU3sacFhwDNikAMNVauxmIxYcnenP4greO4HF--2G6gsB0yl1ZC9XSK-okIxqj8kniUDtk-rQeNRXTa-UeZ3OOkB9VstZclytLJNNmqrRvMYDknFT6UAImUFZSZN2alpfyGNWq4-YVgc5MwEsedWD8uEYKMce7mi7nC1VJRi_CuNdyX4RvTls5NzOq8IF5kgGs4MeXHf1RZDt9-b8Jg4DKIuFDwnAoRHf-EIsjnL_vw6ZmaWxaj6Vr9YQqcgBsQoE_czee8yyBTtN96hQT7rs2ooxgD5N_OYwntSys-EG3rp9ryML7IYZJR7NftardP7IOBeGdpsH2z7mcP7F020R5bwDIL2ly6VIlh-KyVnTS_cWF-G30QIBdDfUcmITimXF-Ra1VtlODkpWGZ-vD5xm35F6xFJagEVKXy9dCOzYz-_Srh7DFHwICpgvlWHN9vYk5s5AH8A"
};


var voteYes = document.querySelector('.vote-yes');
var voteNo = document.querySelector('.vote-no');
var current_key = ""
var counter = 0;

voteYes.onclick = function () {
    post_vote("YES")
};

voteNo.onclick = function () {
    post_vote("NO")
};

function post_vote(vote) {
    var ajaxRequest = new XMLHttpRequest();
    var voteUrl = '/vote?vote='+ vote +'&key=' + current_key + '&_csrf_token=' + csrf_token;
    ajaxRequest.open('POST', voteUrl, true);
    ajaxRequest.setRequestHeader('Content-Type', 'application/json');
    ajaxRequest.send();
    getNextWord();
}



var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};


function getNextWord() {
    counter++;
    if (counter>32) {
        window.location="/review_thanks";
        return;
    }
    var progress = document.querySelector('.progress-display');
    progress.innerText = counter + "/32";
    //show_data(json_x)
    getJSON('get_to_vote',
        function(err, data) {
            if (err == null) {
                show_data(data)
            }
        });
}

function show_data(data) {
    var player = document.querySelector('.vote-display audio');
    var source = document.querySelector('.vote-display audio source');
    source.src = data.url;
    player.load();
    player.play();
    var label = document.querySelector('.label-display');
    label.innerText = data.label;
    current_key = data.key;
}


getNextWord()