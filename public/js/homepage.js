function getRisksCount(){
    var count = fetch("/api/scans/riskCount");
    const riskLabel = document.getElementById("risks-count");
    console.log(count)
    // riskLabel.innerText = count;
    riskLabel.innerText = 3;
}
$(document).ready(function(){
    getRisksCount();
});