@php $title = "Payment Details"; $atitle ="Histroy";
@endphp
@include('layouts.headercss')
  
<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="head-title-part">
                  <h1>Payment Details</h1>
                </div>

              </div>


              <div class="dashboard-body">
                   
                   <div class="row">


                    <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                 

                      <div class="profile-card">
                              <h3>Transaction Details</h3>
                              <div class="table-responsive site-scroll" data-simplebar>
                  <table class="table table-small-font no-mb table-borderded">
                    <tbody>
                      
                      
                      <tr>
                        <td class="text-right">Transaction ID :</td>
                        <td>{{ $trans->txn_id ? $trans->txn_id :'-' }}</td>
                      </tr>                     
                      <tr>
                        <td class="text-right">Time Submitted :</td>
                        <td>{{ date('F d Y H:i:s', strtotime($trans->created_at)) }}  </td>
                      </tr>
                      
                      <tr>    
                        <td class="text-right">Status :</td>
                        <td>@if($trans->status == 0)     Waiting for buyer funds
                          @elseif($trans->status == -1)
                          Cancelled / Timed Out
                          @elseif($trans->status == 1)
                          We have confirmed coin reception from the buye
                          @elseif($trans->status == 2)
                          Queued for nightly payout (if you have the Payout Mode for this coin set to Nightly)
                          @elseif($trans->status == 100)
                          Payment Complete. We have sent your coins to your payment address or 3rd party payment system reports the payment complete
                          @endif
                        </td>
                      </tr>
                      
                      <tr>
                        <td class="text-right">Received Amount :</td>
                        <td> {{ $trans->received_amount ? $trans->received_amount : '-' }} {{ $trans->currency2 }}</td>
                      </tr>
                      
                      <tr>
                        <td class="text-right">Fee :</td>
                        <td>{{ $trans->fee ? $trans->fee :'0'  }} + coin TX fee</td>
                      </tr>
                      
                      
                      <tr>
                        <td class="text-right">Sender :</td>
                        @if(isset($trans->BuyerInformation['first_name']))
                        <td>{{ $trans->BuyerInformation['first_name'] ? $trans->BuyerInformation['first_name'] : '-' }}</td>
                        @else
                        <td>-</td>
                        @endif
                      </tr>
                      
                      
                      
                      <tr>
                        <td class="text-right">Sender's Email :</td>
                        @if(isset($trans->BuyerInformation['email']))
                        <td>{{ $trans->BuyerInformation['email'] ? $trans->BuyerInformation['email'] : '-' }}</td>
                        @else
                        <td>-</td>
                        @endif
                      </tr>                   
                      
                      
                      <tr>
                        <td class="text-right">Payment type :</td>
                        @if($trans->cmd == '_pos')
                        <td>POS Button</td>
                        @elseif($trans->cmd == '_cart_add')
                        <td>Shop Cart Button</td>
                        @elseif($trans->cmd == '_donation')
                        <td>Donation Button</td>
                        @elseif($trans->cmd == '_pay_simple')
                        <td>Simple  Button</td>
                        @elseif($trans->cmd == '_pay_advanced')
                        <td>Advanced  Button</td>
                        @else
                        <td>Advanced Button</td>
                        @endif
                      </tr>
                      <tr>
                        <td class="text-right">Complete Time :</td>
                        <td>{{ date('F d Y H:i:s', strtotime($trans->updated_at)) }}  </td>
                      </tr>
                      
                      
                    </tbody>
                  </table>
                </div>
  
                          </div>
                    </div>



                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-12 col-xs-12">

                      

                      <div class="profile-card">
                         <h3>Checkout Information</h3>
                         <table class="table table-small-font no-mb table-borderded">
                  <tbody>
                    
                    <tr>      
                      <td class="text-right">Item Number :</td>
                      <td>{{ $trans->item_number ? $trans->item_number :'-' }}</td>
                    </tr>
                    
                    <tr>      
                      <td class="text-right">Item Name :</td>
                      <td>{{ $trans->item_name ? $trans->item_name :'-' }}</td>
                    </tr>
                    
                    
                    <tr>      
                      <td class="text-right">Quantity :</td>
                      <td>{{ $trans->quantity ? $trans->quantity :'-' }}</td>
                    </tr>
                    
                    <tr>      
                      <td class="text-right">Price Per item :</td>
                      <td>{{ $trans->item_amount ? $trans->item_amount :'-' }} {{ $trans->currency1 }}</td>
                    </tr>
                    
                    <tr>
                      <td class="text-right">Subtotal :</td>
                      <td>{{ number_format($trans->subtotal,8) }} {{ $trans->currency1 }}</td>
                    </tr>
                    
                    <tr>
                      <td class="text-right">Tax :</td>
                      <td>{{ number_format($trans->tax,8) }} {{ $trans->currency1 }}</td>
                    </tr>
                    
                    <tr>
                      <td class="text-right">Shipping :</td>
                      <td>{{ $trans->shipping ? $trans->shipping :'-' }}</td>
                    </tr>
                    
                    <tr>
                      <td class="text-right">Total :</td>
                      <td>{{ $trans->subtotal ? $trans->subtotal :'-' }} {{ $trans->currency1 }}</td>
                    </tr>
                    
                    <tr>
                      <td class="text-right">Checkout Amount :</td>
                      <td>{{ $trans->subtotal ? $trans->amount2 :'-' }} {{ $trans->currency2 }}</td>
                    </tr>
                    
                    
                  </tbody>
                </table>
                         
                      </div>

                    </div>


                   </div>

              </div>
          
        </div>

     </div>
  </div>
</section>





</body>
</html>
