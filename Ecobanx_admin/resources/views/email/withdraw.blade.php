@include('email.header')

<tr><td align='left'>&nbsp;</td><td style='text-align:left;font-size: 15px;color:#000;'>Hi {{ $details['user'] }},</td><td align='left'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='1' style='padding:0px;'></td></tr>
@if($details['status'] == 'Accept')
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Your {{ $details['amount'] }} {{ $details['coin'] }} Withdraw Request has been approved by admin . Kindly login your {{ config('app.name') }} account and check {{ $details['coin'] }} withdraw history </td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
@elseif($details['status'] == 'Cancel')
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Your {{ $details['amount'] }} {{ $details['coin'] }} Withdraw Request has been Cancelled by admin . Kindly login your {{ config('app.name') }} account and check {{ $details['coin'] }} withdraw history </td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
@elseif($details['status'] == 'Waiting')
<tr><td align='left' style='padding-top:0px;'>&nbsp;</td><td style='text-align:left;font-size:15px;color:#000;padding-top:0px;'>Your {{ $details['amount'] }} {{ $details['coin'] }} Withdraw Request has been Waiting Process . Kindly login your {{ config('app.name') }} account and check {{ $details['coin'] }} withdraw history </td><td align='left' style='padding-top:0px;'>&nbsp;</td></tr>
@endif
<tr><td colspan='3' align='center' height='30' style='padding:0px;'></td></tr>


@include('email.footer')

