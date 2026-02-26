<style>
.passwordChange {
    display: none;
}
</style>
<footer class="footer hidden-xs-down">
    <p>Copyright@<?php echo $curYear = date('Y');?> All Rights Reserved.</p>
</footer>
</section>
</main>

<script src="{{ url('adminpanel/js/popper.min.js') }}"></script>
<script src="{{ url('adminpanel/js/bootstrap.min.js') }}"></script>
<script src="{{ url('adminpanel/js/app.min.js') }}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/js/bootstrap-datepicker.min.js"></script>
<script src="{{ url('adminpanel/js/jquery.scrollbar/jquery.scrollbar.min.js') }}"></script>
<script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
<script src="{{ url('adminpanel/ckeditor/ckeditor.js') }}"></script>
<script type="text/javascript">
$('#loding').hide();
$(".allownumericwithdecimal").on("keypress keyup blur", function(event) {
    $(this).val($(this).val().replace(/[^0-9\.]/g, ''));
    if ((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57)) {
        event.preventDefault();
    }
});

$("#proof_upload1").change(function() {
    var limit_size = 1048576;
    var photo_size = this.files[0].size;
    if (photo_size > limit_size) {
        $("#kyc_btn").attr('disabled', true);
        $('#proof_upload1').val('');
        alert('Image Size Larger than 1MB');
    } else {
        $("#proof_upload1").text(this.files[0].name);
        $("#kyc_btn").attr('disabled', false);
        var file = document.getElementById('proof_upload1').value;
        var ext = file.split('.').pop();
        switch (ext) {
            case 'jpg':
            case 'JPG':
            case 'Jpg':
            case 'jpeg':
            case 'JPEG':
            case 'Jpeg':
            case 'png':
            case 'PNG':
            case 'Png':
                readURL8(this);
                break;
            default:
                alert('Upload your proof like JPG, JPEG, PNG');
                break;
        }
    }
});

function readURL8(input) {
    var limit_size = 1048576;
    var photo_size = input.files[0].size;
    if (photo_size > limit_size) {
        alert('Image size larger than 1MB');
    } else {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#blah').attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
}

$("#proof_upload2").change(function() {
    var limit_size = 1048576;
    var photo_size = this.files[0].size;
    if (photo_size > limit_size) {
        $("#kyc_btn").attr('disabled', true);
        $('#proof_upload2').val('');
        alert('Image Size Larger than 1MB');
    } else {
        $("#proof_upload2").text(this.files[0].name);
        $("#kyc_btn").attr('disabled', false);
        var file = document.getElementById('proof_upload2').value;
        var ext = file.split('.').pop();
        switch (ext) {
            case 'jpg':
            case 'JPG':
            case 'Jpg':
            case 'jpeg':
            case 'JPEG':
            case 'Jpeg':
            case 'png':
            case 'PNG':
            case 'Png':
                readURL7(this);
                break;
            default:
                alert('Upload your proof like JPG, JPEG, PNG');
                break;
        }
    }
});

function readURL7(input) {
    var limit_size = 1048576;
    var photo_size = input.files[0].size;
    if (photo_size > limit_size) {
        alert('Image Size Larger than 1MB');
    } else {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#doc3').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
}

$('#accountname').on('keypress', function(event) {
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
        event.preventDefault();
        return false;
    }
});

$(function() {
    $('.adminaddress').keyup(function() {
        var yourInput = $(this).val();
        re = /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi;
        var isSplChar = re.test(yourInput);
        if (isSplChar) {
            var no_spl_char = yourInput.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            $(this).val(no_spl_char);
        }
    });
});

$('.datepicker4').each(function(e) {
    e.datepicker({
        format: 'yy-mm-dd',
        autoclose: true
    });
    $(this).on("click", function() {
        e.datepicker("show");
    });
});

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 &&
        (charCode < 48 || charCode > 57))
        return false;

    return true;
}

$(document).ready(function() {
    //called when key is pressed in textbox
    $("#numberonly").keypress(function(e) {
        //if the letter is not digit then display error and don't type anything
        if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
            //display error message
            $("#errmsg").html("Digits Only").show().fadeOut("slow");
            return false;
        }
    });
});
$("#reason").on("keydown", function(e) {
    var c = $("#reason").val().length;
    if (c == 0)
        return e.which !== 32;
});

$('.date-picker').datepicker({
    format: 'yy-mm-dd'
});

function readURL1(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#doc1').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#file-upload1").change(function() {
    $("#file-name1").text(this.files[0].name);
    readURL1(this);
});

function readURL2(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $('#doc2').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#file-upload2").change(function() {
    $("#file-name2").text(this.files[0].name);
    readURL2(this);
});

$(document).ready(function() {
    $("#btn_update").click(function() {
        $('#btn_update').hide();
    });
});

$(".adminchat").click(function() {
    var message = $('.message1').val();
    var chat_id = $('#chat_id').val();
    var userid = $('#userid').val();
    if (message == '') {
        $("#require_msg").show();
    }
    if (message != '') {
        $("#chatbtn").val("Please Wait...").attr('disabled', 'disabled');
        //$("#adminchat_div").animate({ scrollTop: $('#adminchat_div').prop("scrollHeight")}, 1000);
        $.ajax({
            url: '{{ url("admin/tickets/adminsavechat") }}',
            type: 'POST',
            dataType: "json",
            data: {
                "_token": "{{ csrf_token() }}",
                "message": $('.message1').val(),
                "chat_id": $('#chat_id').val(),
                "userid": $('#userid').val()
            },
            success: function(request) {
                $('.message1').val('');
                if (request.msg == 'success') {
                    $('.message1').val('');
                    $('#sug_msg').show();
                    window.setTimeout(function() {
                        location.reload()
                    }, 2000);
                } else if (request.msg == 'required') {
                    $('#require_msg').show();
                    window.setTimeout(function() {
                        location.reload()
                    }, 2000);
                } else {
                    $('#sug_msg').hide();
                    $('#fail_msg').show();
                    $('#sug_msg').hide();
                    window.setTimeout(function() {
                        location.reload()
                    }, 2000);
                }
            }
        });
    }
});
</script>

<script>
jQuery(document).ready(function($) {


    var type = $('#coin_type :selected').val();


    if (type == 'token' || type == 'erctoken' || type == 'trxtoken' || type == 'bsctoken' || type ==
        'polytoken') {
        $('#contract').show();
        $('#abi').show();
    } else {
        $('#contract').hide();
        $('#abi').hide();

    }

    $('#coin_type').on('change', function() {
        var type = this.value;
        if (type == 'token' || type == 'erctoken' || type == 'trxtoken' || type == 'bsctoken' || type ==
            'polytoken') {
            $('#contract').show();
            $('#abi').show();
        } else {
            $('#contract').hide();
            $('#abi').hide();

        }
    });
});
</script>

<script type="text/javascript">
$('textarea').each(function() {
    this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
}).on('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});
</script>
<!--Start of Tawk.to Script-->
<!-- <script defer>
setTimeout(function() {
    var Tawk_API = Tawk_API || {},
        Tawk_LoadStart = new Date();

    (function() {
        var s1 = document.createElement("script"),
            s0 = document.getElementsByTagName("script")[0];
        s1.async = true;
        s1.src = 'https://embed.tawk.to/676134feaf5bfec1dbdd5a5b/1if9re0vu';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s0.parentNode.insertBefore(s1, s0);
    })();

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function() {
        const tryRevealWidget = () => {
            const iframe = document.querySelector('iframe[title="chat widget"]');
            const widget = iframe?.parentElement;

            if (iframe && widget) {
                widget.style.setProperty("display", "block", "important");
                widget.classList.remove("widget-hidden");
                widget.style.setProperty("position", "fixed", "important");

                if (window.innerWidth <= 1199) {
                    // Mobile view
                    iframe.style.setProperty("bottom", "100px", "important");
                    iframe.style.setProperty("right", "10px", "important");
                    iframe.style.setProperty("top", "auto", "important");
                } else {
                    // Desktop view
                    iframe.style.setProperty("bottom", "0px", "important");
                    iframe.style.setProperty("right", "0px", "important");
                    iframe.style.setProperty("top", "auto", "important");
                }

                console.log("✅ Tawk widget iframe repositioned.");
            } else {
                setTimeout(tryRevealWidget, 500); // Retry if not found
            }
        };

        // Wait a little to let Tawk render DOM
        setTimeout(tryRevealWidget, 1000);

        // Re-apply on resize too
        window.addEventListener("resize", tryRevealWidget);
    };
}, 1000);
</script> -->
<!--End of Tawk.to Script-->
</body>

</html>