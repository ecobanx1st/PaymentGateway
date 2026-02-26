<tr><td align='left' style='padding-bottom:0px;'>&nbsp;</td><td style='text-align:left;font-size:13px;line-height:19px;color:#000;padding-bottom:0px;'>Kindly protect your password and email ID used for registration for safety purpose. You can enable 2FA to add an extra layer of security to your profile.</td><td align='left' style='padding-bottom:0px;'>&nbsp;</td></tr>

@php
$nYear = date("Y") + 1;
$years = date("Y");
$yearTo = $years." - ".$nYear;
@endphp

<tr><td align='left' style='padding-bottom:0px;'>&nbsp;</td><td style='text-align:left;font-size:14px;line-height:23px;color:#000;padding-bottom:0px;'>Regards <br />{{ config('app.name') }} Team</td><td align='left' style='padding-bottom:0px;'>&nbsp;</td></tr>
<tr><td colspan='3' align='center' height='3' style='padding:0px;'></td></tr>
<tr><td colspan='3' align='center' height='15' style='padding:0px;'></td></tr>
<tr><td colspan='3' align='center' height='15' style='padding:0px;'></td></tr>
<tr><td colspan='3' height='50' style='text-align:center; background-color:#0788ed;padding:0px;'>Copyright © {{ config('app.name') }}, {{ $yearTo ?? $years}} . All Rights Reserved.</td></tr>
</table>
</body>
</html>
