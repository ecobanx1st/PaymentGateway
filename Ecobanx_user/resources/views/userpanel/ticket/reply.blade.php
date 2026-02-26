@include('inc.header')  
<div class="page-container container-fluid">
  <section id="main-content">
    <div class="wrapper main-wrapper">	
      <div class="chatboxbg">		
        <div class="col-md-8 col-sm-12 col-xs-12 center-content">
          <header class="panel_header">
            <h2 class="title text-uppercase">chat
              <span class="pull-right righttextbtn">
                <a href="{{ url('/tickets/list') }}" class="btn orangebg">Back</a>
              </span>
            </h2>										
          </header>
          <section class="box">
            <div class="content-body contb">
              <div class="form-container">
                <div class="pg panel panel-primary">						 
                  <div class="panel-body" >
                    <div id="chat" class="chat-scroll">
                      <ul class="chat">
                        <input type="hidden" name="chat_id"  id="chat_id" value="{{ $chatlist[0]->ticketid }}">
                        <input type="hidden" name="userid"  id="userid" value="{{ $chatlist[0]->uid }}">
                        @if($chatlist)
                        @foreach ($chatlist as $row)
                        @if($row['message'] !="")
                        <li class="left clearfix">
                          <span class="chat-img pull-left">
                            <img src="{{ url('public/assets/images/chat-2.jpg') }}" alt="User Avatar" class="img-circle" />
                          </span>
                          <div class="chat-body clearfix">
                            <div class="header">
                              <strong class="primary-font">{{ $row->userdetails['name'] }}</strong> <small class="pull-right text-muted">
                                <span class="fa fa-clock-o"></span> {{ humanTiming(strtotime($row['created_at'])) }}</small>
                              </div>
                              <p>
                                {{ $row['message'] }}   
                              </p>
                            </div>
                          </li>
                          @endif 
                          @if($row['reply']!="")
                          <li class="right clearfix"><span class="chat-img pull-right">
                            <img src="{{ url('public/assets/images/chat-1.jpg') }}" alt="User Avatar" class="img-circle" />
                          </span>
                          <div class="chat-body clearfix">
                            <div class="header">
                              <small class="text-muted"><span class="fa fa-clock-o"></span>{{ humanTiming(strtotime($row['created_at'])) }}</small>
                              <strong class="pull-right primary-font">Admin</strong>
                            </div>
                            <p>
                              {{ $row['reply'] }}
                            </p>
                          </div>
                        </li>
                        @endif
                        @endforeach 
                        @endif  
                      </ul>
                    </div>
                    <div class="panel-footer">
                      <div class="form-group">
                        <input id="btn-input" type="text" class="form-control input-lg message" autocomplete="off" placeholder="Type your message here">
                      </div>
                      <div align="center">
                        <input type="button" id="btn-chat" value="Send" class="btn orangebg add">
                      </div>
                    </div>
                  </div>
                </div>
                <p id="msg"></p>
                <div class="alert alert-danger"  style="display:none;" id="require_msg" role="alert">
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Failed! Must fill all the fields!
                </div>
                <div class="alert alert-success"  style="display:none;" id="sug_msg" role="alert">
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>success! Added successfully!
                </div>
                <div class="alert alert-danger"  style="display:none;" id="fail_msg" role="alert">
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>Failed! Try again!
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</div>
@include('inc.footer')
<script>
  $( document ).ready(function() {
    $("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight")}, 1000);
  });

  $( document ).ready(function() {
    $(".add").click(function() {
      var message = $('.message').val();
      var chat_id=$('#chat_id').val();
      var userid=$('#userid').val();
      event.preventDefault();
      $("#btn-chat").val("Please Wait...").attr('disabled', 'disabled');
      $.ajax({
        url: '{{ url("tickets/usersavechat") }}',
        type: 'POST',
        dataType : "json",
        data: {
          "_token": "{{ csrf_token() }}",
          "ordertype": $('#sb-ordertype').val(),
          "message": $('.message').val(),
          "chat_id": $('#chat_id').val(),
          "userid": $('#userid').val()
        }, 
        success: function (request) {
          $("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight")}, 1000);
          if(request.msg == 'success') {
            $('#sug_msg').show(); 
            window.setTimeout(function(){location.reload()},2000);
          } else if(request.msg == 'required') {
            $('#require_msg').show(); 
            window.setTimeout(function(){location.reload()},2000);
          } else {
            $('#sug_msg').hide();
            $('#fail_msg').show(); 
            $('#sug_msg').hide();
            window.setTimeout(function(){location.reload()},1000);
          }
        }
      });  
    });
  });
</script>